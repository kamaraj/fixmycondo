"""
FixMyCondo - Database Models
All SQLAlchemy models for the application
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float, 
    ForeignKey, Enum as SQLEnum, Table, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


# ============================================
# ENUMS
# ============================================

class UserRole(str, enum.Enum):
    """User roles in the system"""
    SUPER_ADMIN = "super_admin"
    BUILDING_ADMIN = "building_admin"
    COMMITTEE = "committee"
    RESIDENT = "resident"
    TECHNICIAN = "technician"
    VENDOR = "vendor"


class ComplaintStatus(str, enum.Enum):
    """Complaint lifecycle status"""
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    PENDING_PARTS = "pending_parts"
    PENDING_VENDOR = "pending_vendor"
    COMPLETED = "completed"
    CLOSED = "closed"
    REOPENED = "reopened"
    CANCELLED = "cancelled"


class ComplaintPriority(str, enum.Enum):
    """Complaint priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplaintCategory(str, enum.Enum):
    """Complaint categories"""
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    LIFT = "lift"
    SECURITY = "security"
    COMMON_AREA = "common_area"
    CLEANING = "cleaning"
    RENOVATION = "renovation"
    STRUCTURAL = "structural"
    PEST = "pest"
    PARKING = "parking"
    OTHER = "other"


class BookingStatus(str, enum.Enum):
    """Facility booking status"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class VendorQuoteStatus(str, enum.Enum):
    """Vendor quote status"""
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


# ============================================
# MODELS
# ============================================

class Building(Base):
    """Building/Condo information"""
    __tablename__ = "buildings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), default="Malaysia")
    total_blocks = Column(Integer, default=1)
    total_units = Column(Integer, default=0)
    
    # Management info
    manager_name = Column(String(255))
    manager_email = Column(String(255))
    manager_phone = Column(String(50))
    
    # Subscription
    subscription_tier = Column(String(50), default="standard")
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    units = relationship("Unit", back_populates="building", cascade="all, delete-orphan")
    facilities = relationship("Facility", back_populates="building", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="building", cascade="all, delete-orphan")
    users = relationship("User", back_populates="building")


class Unit(Base):
    """Individual units/apartments in a building"""
    __tablename__ = "units"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    unit_number = Column(String(50), nullable=False)
    block = Column(String(50))
    floor = Column(Integer)
    unit_type = Column(String(100))  # e.g., "1BR", "2BR", "Studio"
    size_sqft = Column(Float)
    is_occupied = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    building = relationship("Building", back_populates="units")
    residents = relationship("User", back_populates="unit")
    complaints = relationship("Complaint", back_populates="unit")


class User(Base):
    """User accounts - residents, technicians, admins, vendors"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255))
    phone = Column(String(50))
    profile_image = Column(String(500))
    
    # Role and building association
    role = Column(SQLEnum(UserRole), default=UserRole.RESIDENT)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    
    # For technicians
    speciality = Column(String(255))  # e.g., "Plumbing", "Electrical"
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Settings & Preferences
    settings = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    building = relationship("Building", back_populates="users")
    unit = relationship("Unit", back_populates="residents")
    # complaints_created = relationship("Complaint", back_populates="created_by")
    # complaints_assigned = relationship("Complaint", back_populates="assigned_to")
    # complaint_updates = relationship("ComplaintUpdate", back_populates="created_by")
    # bookings = relationship("FacilityBooking", back_populates="user")


class Complaint(Base):
    """Maintenance complaints/issues"""
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"))
    
    # Complaint details
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(SQLEnum(ComplaintCategory), default=ComplaintCategory.OTHER)
    priority = Column(SQLEnum(ComplaintPriority), default=ComplaintPriority.MEDIUM)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.SUBMITTED)
    
    # Media attachments (JSON array of file paths)
    photos = Column(Text)  # JSON array
    videos = Column(Text)  # JSON array
    
    # Assignment
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # SLA tracking
    sla_hours = Column(Integer, default=48)
    sla_deadline = Column(DateTime)
    is_sla_breached = Column(Boolean, default=False)
    
    # Visitor preferences
    preferred_visit_time = Column(DateTime)
    allow_technician_entry = Column(Boolean, default=True)
    
    # Resolution
    resolution_notes = Column(Text)
    resolved_at = Column(DateTime)
    
    # Cost
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    unit = relationship("Unit", back_populates="complaints")
    created_by = relationship("User", foreign_keys=[created_by_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan")
    vendor_quotes = relationship("VendorQuote", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintUpdate(Base):
    """Timeline updates for complaints"""
    __tablename__ = "complaint_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Update content
    status = Column(SQLEnum(ComplaintStatus))
    message = Column(Text)
    photos = Column(Text)  # JSON array for before/after photos
    
    # Cost updates
    cost_update = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    complaint = relationship("Complaint", back_populates="updates")
    created_by = relationship("User")


class Vendor(Base):
    """External vendors/contractors"""
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    
    # Services
    service_type = Column(String(255))  # e.g., "Plumbing", "Electrical", "General"
    license_number = Column(String(100))
    insurance_valid_until = Column(DateTime)
    
    # Rating
    rating = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)
    completed_jobs = Column(Integer, default=0)
    
    # Status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quotes = relationship("VendorQuote", back_populates="vendor")


class VendorQuote(Base):
    """Vendor quotes for complaints"""
    __tablename__ = "vendor_quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    
    # Quote details
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="MYR")
    description = Column(Text)
    estimated_days = Column(Integer)
    
    # Attachments
    quote_document = Column(String(500))  # PDF file path
    
    # Status
    status = Column(SQLEnum(VendorQuoteStatus), default=VendorQuoteStatus.SUBMITTED)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    complaint = relationship("Complaint", back_populates="vendor_quotes")
    vendor = relationship("Vendor", back_populates="quotes")


class Facility(Base):
    """Building facilities available for booking"""
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(String(255))
    capacity = Column(Integer)
    
    # Booking rules
    booking_fee = Column(Float, default=0.0)
    deposit_required = Column(Float, default=0.0)
    min_booking_hours = Column(Integer, default=1)
    max_booking_hours = Column(Integer, default=4)
    advance_booking_days = Column(Integer, default=30)
    
    # Operating hours (JSON: {"monday": {"open": "08:00", "close": "22:00"}, ...})
    operating_hours = Column(Text)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    building = relationship("Building", back_populates="facilities")
    bookings = relationship("FacilityBooking", back_populates="facility", cascade="all, delete-orphan")


class FacilityBooking(Base):
    """Facility booking records"""
    __tablename__ = "facility_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Booking details
    booking_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    # Guest info
    number_of_guests = Column(Integer, default=1)
    purpose = Column(Text)
    
    # Payment
    total_fee = Column(Float, default=0.0)
    deposit_paid = Column(Float, default=0.0)
    is_paid = Column(Boolean, default=False)
    
    # Status
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    facility = relationship("Facility", back_populates="bookings")
    user = relationship("User")


class Announcement(Base):
    """Building announcements"""
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    # Target audience (JSON array: ["all", "block_a", "committee"])
    target_audience = Column(Text)
    
    # Attachments
    attachments = Column(Text)  # JSON array of file paths
    
    # Notification settings
    send_push = Column(Boolean, default=False)
    send_email = Column(Boolean, default=False)
    send_whatsapp = Column(Boolean, default=False)
    
    # Status
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    building = relationship("Building", back_populates="announcements")

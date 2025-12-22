"""
FixMyCondo - Pydantic Schemas
Request/Response models for API endpoints
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================================
# ENUMS (mirroring SQLAlchemy enums)
# ============================================

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    BUILDING_ADMIN = "building_admin"
    COMMITTEE = "committee"
    RESIDENT = "resident"
    TECHNICIAN = "technician"
    VENDOR = "vendor"


class ComplaintStatus(str, Enum):
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


class ComplaintPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplaintCategory(str, Enum):
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


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class VendorQuoteStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


# ============================================
# BASE SCHEMAS
# ============================================

class BaseSchema(BaseModel):
    """Base schema with common config"""
    class Config:
        from_attributes = True
        use_enum_values = True


# ============================================
# AUTH SCHEMAS
# ============================================

class TokenSchema(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: int
    email: str
    role: str
    exp: datetime


class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    role: UserRole = UserRole.RESIDENT
    building_id: Optional[int] = None
    unit_id: Optional[int] = None


# ============================================
# USER SCHEMAS
# ============================================

class UserBase(BaseSchema):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.RESIDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    building_id: Optional[int] = None
    unit_id: Optional[int] = None


class UserUpdate(BaseSchema):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    speciality: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[dict] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)



class UserResponse(UserBase):
    id: int
    building_id: Optional[int] = None
    unit_id: Optional[int] = None
    speciality: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    settings: dict = {}
    created_at: datetime
    last_login: Optional[datetime] = None


class ResidenceResponse(BaseSchema):
    building_name: str
    building_address: Optional[str] = None
    unit_number: str
    block: Optional[str] = None
    floor: Optional[int] = None
    unit_type: Optional[str] = None
    is_owner: bool = True
    building_manager: Optional[str] = None
    manager_phone: Optional[str] = None


# ============================================
# BUILDING SCHEMAS
# ============================================

class BuildingBase(BaseSchema):
    name: str = Field(..., min_length=2)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Malaysia"
    total_blocks: int = 1
    total_units: int = 0


class BuildingCreate(BuildingBase):
    manager_name: Optional[str] = None
    manager_email: Optional[EmailStr] = None
    manager_phone: Optional[str] = None


class BuildingUpdate(BaseSchema):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    manager_name: Optional[str] = None
    manager_email: Optional[EmailStr] = None
    manager_phone: Optional[str] = None
    is_active: Optional[bool] = None


class BuildingResponse(BuildingBase):
    id: int
    manager_name: Optional[str] = None
    manager_email: Optional[str] = None
    manager_phone: Optional[str] = None
    subscription_tier: str = "standard"
    is_active: bool = True
    created_at: datetime


# ============================================
# UNIT SCHEMAS
# ============================================

class UnitBase(BaseSchema):
    unit_number: str
    block: Optional[str] = None
    floor: Optional[int] = None
    unit_type: Optional[str] = None
    size_sqft: Optional[float] = None


class UnitCreate(UnitBase):
    building_id: int


class UnitUpdate(BaseSchema):
    unit_number: Optional[str] = None
    block: Optional[str] = None
    floor: Optional[int] = None
    unit_type: Optional[str] = None
    size_sqft: Optional[float] = None
    is_occupied: Optional[bool] = None


class UnitResponse(UnitBase):
    id: int
    building_id: int
    is_occupied: bool = False
    created_at: datetime


# ============================================
# COMPLAINT SCHEMAS
# ============================================

class ComplaintBase(BaseSchema):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    category: ComplaintCategory = ComplaintCategory.OTHER
    priority: ComplaintPriority = ComplaintPriority.MEDIUM


class ComplaintCreate(ComplaintBase):
    unit_id: Optional[int] = None
    preferred_visit_time: Optional[datetime] = None
    allow_technician_entry: bool = True
    photos: Optional[List[str]] = None
    videos: Optional[List[str]] = None


class ComplaintUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ComplaintCategory] = None
    priority: Optional[ComplaintPriority] = None
    status: Optional[ComplaintStatus] = None
    assigned_to_id: Optional[int] = None
    resolution_notes: Optional[str] = None


class ComplaintResponse(ComplaintBase):
    id: int
    building_id: int
    unit_id: Optional[int] = None
    status: ComplaintStatus
    created_by_id: int
    assigned_to_id: Optional[int] = None
    photos: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    sla_hours: int
    sla_deadline: Optional[datetime] = None
    is_sla_breached: bool = False
    estimated_cost: float = 0.0
    actual_cost: float = 0.0
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    # Nested
    created_by: Optional[UserResponse] = None
    assigned_to: Optional[UserResponse] = None


class ComplaintListResponse(BaseSchema):
    id: int
    title: str
    category: ComplaintCategory
    priority: ComplaintPriority
    status: ComplaintStatus
    unit_number: Optional[str] = None
    sla_deadline: Optional[datetime] = None
    is_sla_breached: bool = False
    created_at: datetime


# ============================================
# COMPLAINT UPDATE SCHEMAS
# ============================================

class ComplaintUpdateCreate(BaseSchema):
    message: str
    status: Optional[ComplaintStatus] = None
    cost_update: Optional[float] = None
    photos: Optional[List[str]] = None


class ComplaintUpdateResponse(BaseSchema):
    id: int
    complaint_id: int
    created_by_id: int
    status: Optional[ComplaintStatus] = None
    message: str
    photos: Optional[List[str]] = None
    cost_update: Optional[float] = None
    created_at: datetime
    created_by: Optional[UserResponse] = None


# ============================================
# VENDOR SCHEMAS
# ============================================

class VendorBase(BaseSchema):
    name: str
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None


class VendorCreate(VendorBase):
    license_number: Optional[str] = None
    insurance_valid_until: Optional[datetime] = None


class VendorUpdate(BaseSchema):
    name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None
    is_active: Optional[bool] = None


class VendorResponse(VendorBase):
    id: int
    license_number: Optional[str] = None
    insurance_valid_until: Optional[datetime] = None
    rating: float = 0.0
    total_jobs: int = 0
    completed_jobs: int = 0
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime


# ============================================
# VENDOR QUOTE SCHEMAS
# ============================================

class VendorQuoteCreate(BaseSchema):
    complaint_id: int
    vendor_id: int
    amount: float
    description: Optional[str] = None
    estimated_days: Optional[int] = None
    quote_document: Optional[str] = None


class VendorQuoteUpdate(BaseSchema):
    status: VendorQuoteStatus


class VendorQuoteResponse(BaseSchema):
    id: int
    complaint_id: int
    vendor_id: int
    amount: float
    currency: str = "MYR"
    description: Optional[str] = None
    estimated_days: Optional[int] = None
    quote_document: Optional[str] = None
    status: VendorQuoteStatus
    created_at: datetime
    vendor: Optional[VendorResponse] = None


# ============================================
# FACILITY SCHEMAS
# ============================================

class FacilityBase(BaseSchema):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    booking_fee: float = 0.0
    deposit_required: float = 0.0


class FacilityCreate(FacilityBase):
    building_id: int
    min_booking_hours: int = 1
    max_booking_hours: int = 4
    advance_booking_days: int = 30


class FacilityUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    booking_fee: Optional[float] = None
    is_active: Optional[bool] = None


class FacilityResponse(FacilityBase):
    id: int
    building_id: int
    min_booking_hours: int
    max_booking_hours: int
    advance_booking_days: int
    is_active: bool = True
    created_at: datetime


# ============================================
# FACILITY BOOKING SCHEMAS
# ============================================

class FacilityBookingCreate(BaseSchema):
    facility_id: int
    booking_date: datetime
    start_time: datetime
    end_time: datetime
    number_of_guests: int = 1
    purpose: Optional[str] = None


class FacilityBookingUpdate(BaseSchema):
    status: BookingStatus
    is_paid: Optional[bool] = None


class FacilityBookingResponse(BaseSchema):
    id: int
    facility_id: int
    user_id: int
    booking_date: datetime
    start_time: datetime
    end_time: datetime
    number_of_guests: int
    purpose: Optional[str] = None
    total_fee: float
    deposit_paid: float
    is_paid: bool
    status: BookingStatus
    created_at: datetime
    facility: Optional[FacilityResponse] = None
    user: Optional[UserResponse] = None


# ============================================
# ANNOUNCEMENT SCHEMAS
# ============================================

class AnnouncementBase(BaseSchema):
    title: str = Field(..., min_length=5)
    content: str = Field(..., min_length=10)


class AnnouncementCreate(AnnouncementBase):
    building_id: int
    target_audience: Optional[List[str]] = ["all"]
    attachments: Optional[List[str]] = None
    send_push: bool = False
    send_email: bool = False
    send_whatsapp: bool = False


class AnnouncementUpdate(BaseSchema):
    title: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None


class AnnouncementResponse(AnnouncementBase):
    id: int
    building_id: int
    target_audience: Optional[List[str]] = None
    attachments: Optional[List[str]] = None
    is_published: bool
    published_at: Optional[datetime] = None
    created_at: datetime


# ============================================
# DASHBOARD / STATS SCHEMAS
# ============================================

class DashboardStats(BaseSchema):
    """Dashboard statistics"""
    total_complaints: int = 0
    new_complaints: int = 0
    in_progress_complaints: int = 0
    overdue_complaints: int = 0
    completed_today: int = 0
    
    total_residents: int = 0
    total_units: int = 0
    occupied_units: int = 0
    
    pending_bookings: int = 0
    today_bookings: int = 0


class ComplaintStats(BaseSchema):
    """Complaint statistics by category/status"""
    by_category: dict = {}
    by_status: dict = {}
    by_priority: dict = {}
    avg_resolution_time_hours: float = 0.0
    sla_compliance_rate: float = 0.0


# ============================================
# PAGINATION SCHEMAS
# ============================================

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int

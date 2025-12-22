"""
FixMyCondo - Seed Data Script
Creates synthetic users, buildings, units, complaints, and test data
"""
import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session, create_tables
from app.models import (
    Building, Unit, User, Complaint, ComplaintUpdate,
    Vendor, VendorQuote, Facility, FacilityBooking, Announcement,
    UserRole, ComplaintStatus, ComplaintPriority, ComplaintCategory,
    BookingStatus, VendorQuoteStatus
)
from app.services.auth import hash_password
from app.services.sla_engine import calculate_sla_deadline, get_sla_hours
import json


# ============================================
# SYNTHETIC PERSONAS
# ============================================

PERSONAS = {
    "residents": [
        {
            "name": "Ahmad Bin Hassan",
            "email": "ahmad.hassan@gmail.com",
            "phone": "016-123-4567",
            "persona": "Young professional, works in IT, tech-savvy, quick to report issues via app"
        },
        {
            "name": "Sarah Tan Wei Ling",
            "email": "sarah.tan@hotmail.com",
            "phone": "012-987-6543",
            "persona": "Working mother with 2 kids, concerned about safety and cleanliness"
        },
        {
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@yahoo.com",
            "phone": "019-456-7890",
            "persona": "Retired engineer, detailed in descriptions, follows up regularly"
        },
        {
            "name": "Nurul Izzah",
            "email": "nurul.izzah@gmail.com",
            "phone": "017-234-5678",
            "persona": "University student, budget-conscious, reports issues affecting common areas"
        },
        {
            "name": "Michael Wong",
            "email": "michael.wong@corporate.com",
            "phone": "018-345-6789",
            "persona": "Business executive, values quick resolution, premium expectations"
        },
        {
            "name": "Fatimah Abdullah",
            "email": "fatimah.a@gmail.com",
            "phone": "013-567-8901",
            "persona": "Elderly resident, needs assistance with app, prefers phone calls"
        },
        {
            "name": "David Lim Chee Keong",
            "email": "david.lim@email.com",
            "phone": "011-678-9012",
            "persona": "Property investor with multiple units, expects professional service"
        },
        {
            "name": "Priya Devi",
            "email": "priya.devi@gmail.com",
            "phone": "014-789-0123",
            "persona": "Nurse, shift worker, needs flexible appointment times"
        },
        {
            "name": "Chen Wei Ming",
            "email": "weiming.chen@outlook.com",
            "phone": "016-890-1234",
            "persona": "New resident, unfamiliar with building rules, asks many questions"
        },
        {
            "name": "Aisha Binti Yusof",
            "email": "aisha.yusof@gmail.com",
            "phone": "019-901-2345",
            "persona": "Community volunteer, active in resident committee, reports on behalf of others"
        }
    ],
    "technicians": [
        {
            "name": "Raju Krishnan",
            "email": "raju.tech@fixmycondo.com",
            "phone": "012-111-2222",
            "speciality": "Plumbing, General Maintenance",
            "persona": "Experienced plumber, 15 years in the trade, reliable and thorough"
        },
        {
            "name": "Ali Bin Omar",
            "email": "ali.tech@fixmycondo.com",
            "phone": "012-333-4444",
            "speciality": "Electrical, HVAC",
            "persona": "Certified electrician, safety-conscious, documents everything"
        },
        {
            "name": "Tan Ah Kow",
            "email": "tan.tech@fixmycondo.com",
            "phone": "012-555-6666",
            "speciality": "General Maintenance, Carpentry",
            "persona": "Jack of all trades, quick fixes, good with residents"
        }
    ],
    "admins": [
        {
            "name": "Jennifer Lee",
            "email": "jennifer.lee@condomanagement.com",
            "phone": "012-999-8888",
            "persona": "Building manager, 10 years experience, efficient and organized"
        },
        {
            "name": "Mohammed Faiz",
            "email": "faiz@condomanagement.com",
            "phone": "012-888-7777",
            "persona": "Assistant manager, handles daily operations, tech-savvy"
        }
    ],
    "vendors": [
        {
            "name": "Ah Seng",
            "company": "Ah Seng Plumbing Services",
            "email": "ahseng.plumbing@gmail.com",
            "phone": "012-111-0001",
            "service": "Plumbing",
            "persona": "30 years experience, known for quality work, slightly higher prices"
        },
        {
            "name": "Kumar",
            "company": "Kumar Electrical Works",
            "email": "kumar.electrical@gmail.com",
            "phone": "012-222-0002",
            "service": "Electrical",
            "persona": "Licensed contractor, fast response, competitive pricing"
        },
        {
            "name": "Lee Brothers",
            "company": "Lee Brothers General Contractor",
            "email": "leebrothers@gmail.com",
            "phone": "012-333-0003",
            "service": "General",
            "persona": "Family business, handles renovations and major repairs"
        },
        {
            "name": "Clean Pro",
            "company": "Clean Pro Services Sdn Bhd",
            "email": "cleanpro@company.com",
            "phone": "03-1234-5678",
            "service": "Cleaning",
            "persona": "Professional cleaning company, contract-based, reliable"
        },
        {
            "name": "Pest Away",
            "company": "Pest Away Solutions",
            "email": "pestaway@company.com",
            "phone": "03-2345-6789",
            "service": "Pest Control",
            "persona": "Licensed pest control, eco-friendly options available"
        }
    ]
}

# ============================================
# SAMPLE COMPLAINTS
# ============================================

SAMPLE_COMPLAINTS = [
    {
        "title": "Water leaking from ceiling in bathroom",
        "description": "There is water dripping from the ceiling in my master bathroom. It seems to be coming from the unit above. The leak started 2 days ago and is getting worse. Please send someone urgently.",
        "category": ComplaintCategory.PLUMBING,
        "priority": ComplaintPriority.HIGH
    },
    {
        "title": "Air-con not cooling properly",
        "description": "The air conditioning in the living room is running but not cooling. Temperature stays at 28°C even when set to 18°C. Unit is 3 years old, last serviced 6 months ago.",
        "category": ComplaintCategory.ELECTRICAL,
        "priority": ComplaintPriority.MEDIUM
    },
    {
        "title": "Lift stuck on 5th floor",
        "description": "Lift B has been stuck on the 5th floor since this morning. The display shows an error code. Many residents are affected, especially elderly ones on higher floors.",
        "category": ComplaintCategory.LIFT,
        "priority": ComplaintPriority.CRITICAL
    },
    {
        "title": "Broken light in basement parking",
        "description": "The lights in parking zone C3 have been flickering for a week and now completely not working. This area is very dark and unsafe at night.",
        "category": ComplaintCategory.ELECTRICAL,
        "priority": ComplaintPriority.MEDIUM
    },
    {
        "title": "Cockroach infestation in common area",
        "description": "There are many cockroaches spotted near the rubbish chute on level 7. This has been happening for the past week. Please arrange for pest control.",
        "category": ComplaintCategory.PEST,
        "priority": ComplaintPriority.HIGH
    },
    {
        "title": "Clogged drain outside unit",
        "description": "The drain outside my unit door is clogged with debris. Water is pooling whenever it rains and mosquitoes are breeding there.",
        "category": ComplaintCategory.PLUMBING,
        "priority": ComplaintPriority.LOW
    },
    {
        "title": "Security guard sleeping on duty",
        "description": "I noticed the night security guard sleeping at the guard house around 2am. This has happened multiple times this week. Please address this security concern.",
        "category": ComplaintCategory.SECURITY,
        "priority": ComplaintPriority.HIGH
    },
    {
        "title": "Pool maintenance issue",
        "description": "The swimming pool water looks cloudy and has a strange smell. The pH level seems off. Please check and treat the water.",
        "category": ComplaintCategory.COMMON_AREA,
        "priority": ComplaintPriority.MEDIUM
    },
    {
        "title": "Illegal renovation noise",
        "description": "Unit 12-05 is doing renovation work on Sundays which is against the rules. The noise is very loud and disturbing. Please take action.",
        "category": ComplaintCategory.RENOVATION,
        "priority": ComplaintPriority.MEDIUM
    },
    {
        "title": "Visitor parking abuse",
        "description": "Some residents are using visitor parking spots for their own vehicles daily. This leaves no space for actual visitors. Please enforce parking rules.",
        "category": ComplaintCategory.PARKING,
        "priority": ComplaintPriority.LOW
    },
    {
        "title": "Gym equipment broken",
        "description": "The treadmill in the gym has been broken for 2 weeks. The belt is torn and unsafe to use. Please repair or replace.",
        "category": ComplaintCategory.COMMON_AREA,
        "priority": ComplaintPriority.LOW
    },
    {
        "title": "Water pressure very low",
        "description": "Water pressure in my unit has been very low for the past 3 days. Shower barely works. Other units on same floor having same issue.",
        "category": ComplaintCategory.PLUMBING,
        "priority": ComplaintPriority.HIGH
    },
    {
        "title": "Intercom not working",
        "description": "The intercom system in my unit stopped working. Cannot communicate with visitors at lobby or receive calls from guard house.",
        "category": ComplaintCategory.ELECTRICAL,
        "priority": ComplaintPriority.MEDIUM
    },
    {
        "title": "Wall crack appearing",
        "description": "A crack has appeared on my living room wall and seems to be growing. Started small but now about 30cm long. Concerned about structural integrity.",
        "category": ComplaintCategory.STRUCTURAL,
        "priority": ComplaintPriority.HIGH
    },
    {
        "title": "Playground equipment rusty",
        "description": "The children's playground equipment is very rusty and some parts are loose. This is dangerous for children playing there.",
        "category": ComplaintCategory.COMMON_AREA,
        "priority": ComplaintPriority.HIGH
    }
]

# ============================================
# SAMPLE ANNOUNCEMENTS
# ============================================

SAMPLE_ANNOUNCEMENTS = [
    {
        "title": "Water Supply Interruption - 25th December 2024",
        "content": """Dear Residents,

Please be informed that there will be a scheduled water supply interruption on 25th December 2024 (Wednesday) from 10:00 AM to 4:00 PM.

This is for essential maintenance work on the main water tank by our appointed contractor.

Please store sufficient water for your usage during this period. We apologize for any inconvenience.

For emergencies, please contact the management office.

Thank you for your understanding.

Warm regards,
Management"""
    },
    {
        "title": "Annual General Meeting (AGM) Notice",
        "content": """Dear Residents,

You are cordially invited to attend the Annual General Meeting (AGM) of our condominium.

Date: 15th January 2025 (Wednesday)
Time: 8:00 PM
Venue: Function Hall, Level G

Agenda:
1. Confirmation of previous AGM minutes
2. Presentation of annual accounts
3. Maintenance fund budget 2025
4. Election of Management Committee
5. Any other business

Proxy forms are available at the management office.

Your attendance is important for the quorum.

Thank you."""
    },
    {
        "title": "Holiday Operating Hours",
        "content": """Dear Residents,

Please note the following operating hours during the festive season:

24th December 2024: 9AM - 1PM (Half day)
25th December 2024: CLOSED (Christmas)
31st December 2024: 9AM - 3PM
1st January 2025: CLOSED (New Year)

The security guard house will remain operational 24/7.

For emergencies, please call: 012-999-8888

Happy Holidays!"""
    },
    {
        "title": "New Gym Equipment Installation",
        "content": """Good news, residents!

We are pleased to announce that new gym equipment has been installed at our fitness center:

- 2 new treadmills
- 1 elliptical trainer  
- Weight bench set
- Yoga mats and accessories

The gym will be temporarily closed on 20th December for installation and will reopen on 21st December.

Gym operating hours: 6:00 AM - 10:00 PM daily

Please follow gym etiquette and wipe equipment after use.

Thank you!"""
    },
    {
        "title": "Reminder: Monthly Maintenance Fee Due",
        "content": """Dear Residents,

This is a reminder that monthly maintenance fees for January 2025 are due by 7th January 2025.

Payment methods:
1. Online banking to CIMB Account: 1234567890
2. Cheque payable to "Harmony Residence JMB"
3. Cash payment at management office (Mon-Fri, 9AM-5PM)

Late payment charges of 8% will apply after the due date as per the Strata Management Act.

Please quote your unit number as reference.

Thank you for your prompt payment."""
    }
]

# ============================================
# FACILITIES
# ============================================

SAMPLE_FACILITIES = [
    {
        "name": "Swimming Pool",
        "description": "Olympic-sized swimming pool with children's wading area",
        "location": "Level G, Block A",
        "capacity": 50,
        "booking_fee": 0.0,
        "deposit_required": 0.0,
        "min_booking_hours": 1,
        "max_booking_hours": 2
    },
    {
        "name": "Function Hall",
        "description": "Air-conditioned hall suitable for parties and gatherings up to 100 pax",
        "location": "Level G, Block B",
        "capacity": 100,
        "booking_fee": 50.0,
        "deposit_required": 200.0,
        "min_booking_hours": 3,
        "max_booking_hours": 8
    },
    {
        "name": "BBQ Pit A",
        "description": "Outdoor BBQ area with gazebo and seating for 20 people",
        "location": "Garden Area",
        "capacity": 20,
        "booking_fee": 30.0,
        "deposit_required": 50.0,
        "min_booking_hours": 2,
        "max_booking_hours": 4
    },
    {
        "name": "BBQ Pit B",
        "description": "Outdoor BBQ area with gazebo and seating for 20 people",
        "location": "Pool Area",
        "capacity": 20,
        "booking_fee": 30.0,
        "deposit_required": 50.0,
        "min_booking_hours": 2,
        "max_booking_hours": 4
    },
    {
        "name": "Tennis Court",
        "description": "Standard tennis court with night lighting",
        "location": "Sports Complex",
        "capacity": 4,
        "booking_fee": 15.0,
        "deposit_required": 0.0,
        "min_booking_hours": 1,
        "max_booking_hours": 2
    },
    {
        "name": "Badminton Court",
        "description": "Indoor badminton court",
        "location": "Sports Complex",
        "capacity": 4,
        "booking_fee": 10.0,
        "deposit_required": 0.0,
        "min_booking_hours": 1,
        "max_booking_hours": 2
    },
    {
        "name": "Meeting Room",
        "description": "Air-conditioned meeting room with projector, whiteboard, and seating for 12",
        "location": "Level 1, Admin Block",
        "capacity": 12,
        "booking_fee": 20.0,
        "deposit_required": 0.0,
        "min_booking_hours": 1,
        "max_booking_hours": 4
    },
    {
        "name": "Gymnasium",
        "description": "Fully equipped fitness center",
        "location": "Level 1, Block A",
        "capacity": 20,
        "booking_fee": 0.0,
        "deposit_required": 0.0,
        "min_booking_hours": 1,
        "max_booking_hours": 2
    }
]

from app.database import async_session, create_tables, drop_tables

async def seed_database():
    """Main function to seed the database with test data"""
    print("Dropping existing tables...")
    await drop_tables()
    print("Creating database tables...")
    await create_tables()
    
    async with async_session() as db:
        print("\nCreating Buildings...")
        buildings = await create_buildings(db)
        
        print("\nCreating Units...")
        units = await create_units(db, buildings)
        
        print("\nCreating Users...")
        users = await create_users(db, buildings, units)
        
        print("\nCreating Vendors...")
        vendors = await create_vendors(db)
        
        print("\nCreating Facilities...")
        facilities = await create_facilities(db, buildings)
        
        print("\nCreating Announcements...")
        await create_announcements(db, buildings)
        
        print("\nCreating Complaints...")
        complaints = await create_complaints(db, buildings, units, users)
        
        print("\nCreating Vendor Quotes...")
        await create_vendor_quotes(db, complaints, vendors)
        
        print("\nCreating Facility Bookings...")
        await create_bookings(db, facilities, users)
        
        await db.commit()
        
    print("\nDatabase seeding completed!")
    print_summary()


async def create_buildings(db: AsyncSession) -> list:
    """Create sample buildings"""
    buildings_data = [
        {
            "name": "Harmony Residence",
            "address": "123 Jalan Harmoni, Taman Harmoni",
            "city": "Kuala Lumpur",
            "state": "Wilayah Persekutuan",
            "postal_code": "50000",
            "country": "Malaysia",
            "total_blocks": 3,
            "total_units": 150,
            "manager_name": "Jennifer Lee",
            "manager_email": "jennifer.lee@condomanagement.com",
            "manager_phone": "012-999-8888",
            "subscription_tier": "premium"
        },
        {
            "name": "Vista Heights",
            "address": "456 Persiaran Vista, Bangsar",
            "city": "Kuala Lumpur",
            "state": "Wilayah Persekutuan",
            "postal_code": "59100",
            "country": "Malaysia",
            "total_blocks": 2,
            "total_units": 80,
            "manager_name": "Mohammed Faiz",
            "manager_email": "faiz@condomanagement.com",
            "manager_phone": "012-888-7777",
            "subscription_tier": "standard"
        }
    ]
    
    buildings = []
    for data in buildings_data:
        building = Building(**data)
        db.add(building)
        buildings.append(building)
    
    await db.flush()
    for b in buildings:
        print(f"  - Created: {b.name} ({b.total_units} units)")
    
    return buildings


async def create_units(db: AsyncSession, buildings: list) -> list:
    """Create sample units for each building"""
    units = []
    blocks = ["A", "B", "C"]
    
    for building in buildings:
        for block in blocks[:building.total_blocks]:
            for floor in range(1, 11):  # 10 floors
                for unit_num in range(1, 4):  # 3 units per floor
                    unit = Unit(
                        building_id=building.id,
                        unit_number=f"{floor:02d}-{unit_num:02d}",
                        block=f"Block {block}",
                        floor=floor,
                        unit_type=random.choice(["Studio", "1BR", "2BR", "3BR"]),
                        size_sqft=random.randint(500, 1500),
                        is_occupied=random.random() > 0.1  # 90% occupied
                    )
                    db.add(unit)
                    units.append(unit)
    
    await db.flush()
    print(f"  - Created {len(units)} units across {len(buildings)} buildings")
    return units


async def create_users(db: AsyncSession, buildings: list, units: list) -> dict:
    """Create synthetic users based on personas"""
    users = {"residents": [], "technicians": [], "admins": []}
    
    # Create super admin
    super_admin = User(
        email="admin@fixmycondo.com",
        hashed_password=hash_password("Admin@123"),
        full_name="Super Admin",
        phone="012-000-0000",
        role=UserRole.SUPER_ADMIN,
        is_active=True,
        is_verified=True
    )
    db.add(super_admin)
    print(f"  - Super Admin: admin@fixmycondo.com / Admin@123")
    
    # Create building admins
    for i, persona in enumerate(PERSONAS["admins"]):
        building = buildings[i % len(buildings)]
        admin = User(
            email=persona["email"],
            hashed_password=hash_password("Admin@123"),
            full_name=persona["name"],
            phone=persona["phone"],
            role=UserRole.BUILDING_ADMIN,
            building_id=building.id,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        users["admins"].append(admin)
        print(f"  - Admin: {persona['email']} / Admin@123")
    
    # Create technicians
    for persona in PERSONAS["technicians"]:
        tech = User(
            email=persona["email"],
            hashed_password=hash_password("Tech@123"),
            full_name=persona["name"],
            phone=persona["phone"],
            role=UserRole.TECHNICIAN,
            building_id=buildings[0].id,
            speciality=persona["speciality"],
            is_active=True,
            is_verified=True
        )
        db.add(tech)
        users["technicians"].append(tech)
        print(f"  - Technician: {persona['email']} / Tech@123")
    
    # Create residents
    occupied_units = [u for u in units if u.is_occupied]
    random.shuffle(occupied_units)
    
    for i, persona in enumerate(PERSONAS["residents"]):
        if i < len(occupied_units):
            unit = occupied_units[i]
            resident = User(
                email=persona["email"],
                hashed_password=hash_password("User@123"),
                full_name=persona["name"],
                phone=persona["phone"],
                role=UserRole.RESIDENT,
                building_id=unit.building_id,
                unit_id=unit.id,
                is_active=True,
                is_verified=True
            )
            db.add(resident)
            users["residents"].append(resident)
            print(f"  - Resident: {persona['email']} / User@123 (Unit {unit.unit_number})")
    
    await db.flush()
    return users


async def create_vendors(db: AsyncSession) -> list:
    """Create sample vendors"""
    vendors = []
    
    for persona in PERSONAS["vendors"]:
        vendor = Vendor(
            name=persona["name"],
            company_name=persona["company"],
            email=persona["email"],
            phone=persona["phone"],
            service_type=persona["service"],
            rating=round(random.uniform(3.5, 5.0), 1),
            total_jobs=random.randint(10, 100),
            completed_jobs=random.randint(8, 95),
            is_verified=random.random() > 0.2,
            is_active=True
        )
        db.add(vendor)
        vendors.append(vendor)
        print(f"  - Vendor: {persona['company']} ({persona['service']})")
    
    await db.flush()
    return vendors


async def create_facilities(db: AsyncSession, buildings: list) -> list:
    """Create sample facilities"""
    facilities = []
    
    for building in buildings:
        for fac_data in SAMPLE_FACILITIES:
            facility = Facility(
                building_id=building.id,
                **fac_data,
                advance_booking_days=30,
                is_active=True
            )
            db.add(facility)
            facilities.append(facility)
    
    await db.flush()
    print(f"  - Created {len(facilities)} facilities")
    return facilities


async def create_announcements(db: AsyncSession, buildings: list):
    """Create sample announcements"""
    for building in buildings:
        for ann_data in SAMPLE_ANNOUNCEMENTS:
            days_ago = random.randint(1, 30)
            announcement = Announcement(
                building_id=building.id,
                title=ann_data["title"],
                content=ann_data["content"],
                target_audience=json.dumps(["all"]),
                send_push=True,
                send_email=True,
                is_published=True,
                published_at=datetime.utcnow() - timedelta(days=days_ago),
                created_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.add(announcement)
    
    await db.flush()
    print(f"  - Created {len(SAMPLE_ANNOUNCEMENTS) * len(buildings)} announcements")


async def create_complaints(db: AsyncSession, buildings: list, units: list, users: dict) -> list:
    """Create sample complaints with various statuses"""
    complaints = []
    statuses = list(ComplaintStatus)
    
    # Get the first resident (demo user: ahmad.hassan@gmail.com) for guaranteed data
    demo_resident = users["residents"][0]
    demo_unit = next((u for u in units if u.id == demo_resident.unit_id), units[0])
    
    for i, comp_data in enumerate(SAMPLE_COMPLAINTS):
        # First 5 complaints go to demo user with specific statuses
        if i < 5:
            resident = demo_resident
            unit = demo_unit
            # Assign specific statuses for testing: 3 open, 2 closed
            if i == 0:
                status = ComplaintStatus.SUBMITTED
            elif i == 1:
                status = ComplaintStatus.IN_PROGRESS
            elif i == 2:
                status = ComplaintStatus.ASSIGNED
            elif i == 3:
                status = ComplaintStatus.COMPLETED
            else:
                status = ComplaintStatus.CLOSED
        else:
            # Rest go to random residents
            resident = random.choice(users["residents"])
            resident_units = [u for u in units if u.id == resident.unit_id]
            unit = resident_units[0] if resident_units else random.choice(units)
            status = random.choice(statuses)
        
        # Calculate dates
        days_ago = random.randint(1, 45)
        created_at = datetime.utcnow() - timedelta(days=days_ago)
        
        # SLA calculation
        sla_hours = get_sla_hours(comp_data["priority"])
        sla_deadline = calculate_sla_deadline(created_at, comp_data["priority"])
        is_breached = status not in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED] and sla_deadline < datetime.utcnow()
        
        # Assign technician for in-progress complaints
        assigned_to = None
        if status in [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.COMPLETED]:
            assigned_to = random.choice(users["technicians"])
        
        complaint = Complaint(
            building_id=unit.building_id,
            unit_id=unit.id,
            title=comp_data["title"],
            description=comp_data["description"],
            category=comp_data["category"],
            priority=comp_data["priority"],
            status=status,
            created_by_id=resident.id,
            assigned_to_id=assigned_to.id if assigned_to else None,
            sla_hours=sla_hours,
            sla_deadline=sla_deadline,
            is_sla_breached=is_breached,
            created_at=created_at,
            updated_at=created_at + timedelta(hours=random.randint(1, 48)),
            resolved_at=created_at + timedelta(hours=random.randint(24, 72)) if status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED] else None,
            estimated_cost=random.choice([0, 50, 100, 200, 500, 1000]),
            actual_cost=random.choice([0, 45, 95, 180, 450, 950]) if status == ComplaintStatus.COMPLETED else 0
        )
        db.add(complaint)
        complaints.append(complaint)
    
    await db.flush()
    
    # Create timeline updates for each complaint
    for complaint in complaints:
        await create_complaint_timeline(db, complaint, users)
    
    print(f"  - Created {len(complaints)} complaints with timelines")
    return complaints


async def create_complaint_timeline(db: AsyncSession, complaint: Complaint, users: dict):
    """Create timeline updates for a complaint"""
    updates = []
    
    # Submitted update
    updates.append(ComplaintUpdate(
        complaint_id=complaint.id,
        created_by_id=complaint.created_by_id,
        status=ComplaintStatus.SUBMITTED,
        message="Complaint submitted successfully. Management has been notified.",
        created_at=complaint.created_at
    ))
    
    if complaint.status in [ComplaintStatus.REVIEWING, ComplaintStatus.ASSIGNED, 
                            ComplaintStatus.IN_PROGRESS, ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]:
        updates.append(ComplaintUpdate(
            complaint_id=complaint.id,
            created_by_id=users["admins"][0].id,
            status=ComplaintStatus.REVIEWING,
            message="Complaint is being reviewed by management.",
            created_at=complaint.created_at + timedelta(hours=2)
        ))
    
    if complaint.status in [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, 
                            ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]:
        updates.append(ComplaintUpdate(
            complaint_id=complaint.id,
            created_by_id=users["admins"][0].id,
            status=ComplaintStatus.ASSIGNED,
            message=f"Job assigned to technician. Expected resolution within {complaint.sla_hours} hours.",
            created_at=complaint.created_at + timedelta(hours=4)
        ))
    
    if complaint.status in [ComplaintStatus.IN_PROGRESS, ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED] and complaint.assigned_to_id:
        updates.append(ComplaintUpdate(
            complaint_id=complaint.id,
            created_by_id=complaint.assigned_to_id,
            status=ComplaintStatus.IN_PROGRESS,
            message="Technician is on-site and working on the issue.",
            created_at=complaint.created_at + timedelta(hours=8)
        ))
    
    if complaint.status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED] and complaint.assigned_to_id:
        updates.append(ComplaintUpdate(
            complaint_id=complaint.id,
            created_by_id=complaint.assigned_to_id,
            status=ComplaintStatus.COMPLETED,
            message="Issue has been resolved. Please confirm if everything is working properly.",
            cost_update=complaint.actual_cost,
            created_at=complaint.resolved_at
        ))
    
    for update in updates:
        db.add(update)


async def create_vendor_quotes(db: AsyncSession, complaints: list, vendors: list):
    """Create vendor quotes for some complaints"""
    quote_count = 0
    
    for complaint in complaints:
        if complaint.priority in [ComplaintPriority.HIGH, ComplaintPriority.CRITICAL]:
            # Get relevant vendors
            relevant_vendors = vendors[:3]  # Take first 3 vendors
            
            for vendor in relevant_vendors:
                quote = VendorQuote(
                    complaint_id=complaint.id,
                    vendor_id=vendor.id,
                    amount=round(random.uniform(100, 2000), 2),
                    currency="MYR",
                    description=f"Quote for {complaint.title}. Includes parts and labor.",
                    estimated_days=random.randint(1, 7),
                    status=random.choice([VendorQuoteStatus.SUBMITTED, VendorQuoteStatus.UNDER_REVIEW, VendorQuoteStatus.APPROVED])
                )
                db.add(quote)
                quote_count += 1
    
    await db.flush()
    print(f"  - Created {quote_count} vendor quotes")


async def create_bookings(db: AsyncSession, facilities: list, users: dict):
    """Create sample facility bookings"""
    booking_count = 0
    
    for facility in facilities[:5]:  # First 5 facilities
        for _ in range(3):  # 3 bookings each
            resident = random.choice(users["residents"])
            booking_date = datetime.utcnow() + timedelta(days=random.randint(1, 14))
            start_hour = random.randint(9, 18)
            
            booking = FacilityBooking(
                facility_id=facility.id,
                user_id=resident.id,
                booking_date=booking_date,
                start_time=booking_date.replace(hour=start_hour, minute=0),
                end_time=booking_date.replace(hour=start_hour + 2, minute=0),
                number_of_guests=random.randint(1, 10),
                purpose="Family gathering" if facility.booking_fee > 0 else None,
                total_fee=facility.booking_fee * 2,
                deposit_paid=facility.deposit_required,
                is_paid=random.random() > 0.3,
                status=random.choice([BookingStatus.PENDING, BookingStatus.CONFIRMED])
            )
            db.add(booking)
            booking_count += 1
    
    await db.flush()
    print(f"  - Created {booking_count} facility bookings")


def print_summary():
    """Print login credentials summary"""
    print("\n" + "="*60)
    print("LOGIN CREDENTIALS")
    print("="*60)
    print("\nMOBILE APP (Tenant/Resident):")
    print("-" * 40)
    for persona in PERSONAS["residents"][:5]:
        print(f"  Email: {persona['email']}")
        print(f"  Password: User@123")
        print(f"  Persona: {persona['persona'][:50]}...")
        print()
    
    print("\nTECHNICIAN APP:")
    print("-" * 40)
    for persona in PERSONAS["technicians"]:
        print(f"  Email: {persona['email']}")
        print(f"  Password: Tech@123")
        print(f"  Speciality: {persona['speciality']}")
        print()
    
    print("\nMANAGEMENT PORTAL:")
    print("-" * 40)
    print(f"  Email: admin@fixmycondo.com")
    print(f"  Password: Admin@123")
    print(f"  Role: Super Admin")
    print()
    for persona in PERSONAS["admins"]:
        print(f"  Email: {persona['email']}")
        print(f"  Password: Admin@123")
        print(f"  Role: Building Admin")
        print()
    
    print("="*60)


if __name__ == "__main__":
    asyncio.run(seed_database())

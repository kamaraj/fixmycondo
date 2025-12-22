"""
FixMyCondo - Facilities API Routes
Facility management and booking
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Facility, FacilityBooking, User, Building, BookingStatus, UserRole
from ..schemas import (
    FacilityCreate, FacilityUpdate, FacilityResponse,
    FacilityBookingCreate, FacilityBookingUpdate, FacilityBookingResponse,
    PaginatedResponse, UserResponse
)
from ..services import get_current_user, require_admin, require_committee

router = APIRouter(prefix="/facilities", tags=["Facilities"])


# ============================================
# FACILITY ENDPOINTS
# ============================================

@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility(
    facility_data: FacilityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new facility (admin only)"""
    # Verify building exists
    result = await db.execute(
        select(Building).where(Building.id == facility_data.building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    facility = Facility(**facility_data.model_dump())
    db.add(facility)
    await db.commit()
    await db.refresh(facility)
    return facility


@router.get("/", response_model=List[FacilityResponse])
async def get_facilities(
    building_id: Optional[int] = None,
    is_active: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of facilities"""
    query = select(Facility)
    filters = [Facility.is_active == is_active]
    
    # Filter by user's building if not super admin
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role != UserRole.SUPER_ADMIN:
        if current_user.building_id:
            filters.append(Facility.building_id == current_user.building_id)
    elif building_id:
        filters.append(Facility.building_id == building_id)
    
    query = query.where(and_(*filters)).order_by(Facility.name)
    
    result = await db.execute(query)
    facilities = result.scalars().all()
    
    return facilities


@router.get("/{facility_id}", response_model=FacilityResponse)
async def get_facility(
    facility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific facility"""
    result = await db.execute(
        select(Facility).where(Facility.id == facility_id)
    )
    facility = result.scalar_one_or_none()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    return facility


@router.patch("/{facility_id}", response_model=FacilityResponse)
async def update_facility(
    facility_id: int,
    update_data: FacilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a facility (admin only)"""
    result = await db.execute(
        select(Facility).where(Facility.id == facility_id)
    )
    facility = result.scalar_one_or_none()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(facility, field, value)
    
    await db.commit()
    await db.refresh(facility)
    return facility


# ============================================
# BOOKING ENDPOINTS
# ============================================

@router.post("/bookings", response_model=FacilityBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: FacilityBookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new facility booking"""
    # Verify facility exists
    result = await db.execute(
        select(Facility).where(Facility.id == booking_data.facility_id)
    )
    facility = result.scalar_one_or_none()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    if not facility.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is not available for booking"
        )
    
    # Check for booking conflicts
    conflict_result = await db.execute(
        select(FacilityBooking).where(
            and_(
                FacilityBooking.facility_id == booking_data.facility_id,
                FacilityBooking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
                or_(
                    and_(
                        FacilityBooking.start_time <= booking_data.start_time,
                        FacilityBooking.end_time > booking_data.start_time
                    ),
                    and_(
                        FacilityBooking.start_time < booking_data.end_time,
                        FacilityBooking.end_time >= booking_data.end_time
                    ),
                    and_(
                        FacilityBooking.start_time >= booking_data.start_time,
                        FacilityBooking.end_time <= booking_data.end_time
                    )
                )
            )
        )
    )
    conflicts = conflict_result.scalars().all()
    
    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Time slot conflicts with existing booking"
        )
    
    # Check advance booking limit
    max_advance = datetime.utcnow() + timedelta(days=facility.advance_booking_days)
    if booking_data.booking_date > max_advance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot book more than {facility.advance_booking_days} days in advance"
        )
    
    # Calculate booking duration and fees
    duration_hours = (booking_data.end_time - booking_data.start_time).total_seconds() / 3600
    
    if duration_hours < facility.min_booking_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum booking duration is {facility.min_booking_hours} hours"
        )
    
    if duration_hours > facility.max_booking_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum booking duration is {facility.max_booking_hours} hours"
        )
    
    total_fee = facility.booking_fee * duration_hours
    
    # Create booking
    booking = FacilityBooking(
        facility_id=booking_data.facility_id,
        user_id=current_user.id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        number_of_guests=booking_data.number_of_guests,
        purpose=booking_data.purpose,
        total_fee=total_fee,
        deposit_paid=0.0,
        status=BookingStatus.PENDING
    )
    
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    return _serialize_booking(booking, facility, current_user)


@router.get("/bookings", response_model=PaginatedResponse)
async def get_bookings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    facility_id: Optional[int] = None,
    status: Optional[BookingStatus] = None,
    my_bookings: bool = False,
    upcoming: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of facility bookings"""
    query = select(FacilityBooking).options(
        selectinload(FacilityBooking.facility),
        selectinload(FacilityBooking.user)
    )
    
    filters = []
    
    # Role-based filtering
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role == UserRole.RESIDENT or my_bookings:
        filters.append(FacilityBooking.user_id == current_user.id)
    
    if facility_id:
        filters.append(FacilityBooking.facility_id == facility_id)
    if status:
        filters.append(FacilityBooking.status == status)
    if upcoming:
        filters.append(FacilityBooking.booking_date >= datetime.utcnow().date())
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.order_by(FacilityBooking.booking_date.desc())
    
    # Get total count
    count_query = select(func.count(FacilityBooking.id))
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    items = [
        _serialize_booking(b, b.facility, b.user)
        for b in bookings
    ]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/bookings/{booking_id}", response_model=FacilityBookingResponse)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific booking"""
    result = await db.execute(
        select(FacilityBooking)
        .options(
            selectinload(FacilityBooking.facility),
            selectinload(FacilityBooking.user)
        )
        .where(FacilityBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return _serialize_booking(booking, booking.facility, booking.user)


@router.patch("/bookings/{booking_id}", response_model=FacilityBookingResponse)
async def update_booking(
    booking_id: int,
    update_data: FacilityBookingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a booking status"""
    result = await db.execute(
        select(FacilityBooking)
        .options(
            selectinload(FacilityBooking.facility),
            selectinload(FacilityBooking.user)
        )
        .where(FacilityBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Only owner or admin can update
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if booking.user_id != current_user.id and user_role not in [UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN, UserRole.COMMITTEE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(booking, field, value)
    
    await db.commit()
    await db.refresh(booking)
    
    return _serialize_booking(booking, booking.facility, booking.user)


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking"""
    result = await db.execute(
        select(FacilityBooking).where(FacilityBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Only owner or admin can cancel
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if booking.user_id != current_user.id and user_role not in [UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    booking.status = BookingStatus.CANCELLED
    await db.commit()


def _serialize_booking(booking: FacilityBooking, facility: Facility, user: User) -> FacilityBookingResponse:
    """Helper to serialize booking response"""
    return FacilityBookingResponse(
        id=booking.id,
        facility_id=booking.facility_id,
        user_id=booking.user_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        number_of_guests=booking.number_of_guests,
        purpose=booking.purpose,
        total_fee=booking.total_fee,
        deposit_paid=booking.deposit_paid,
        is_paid=booking.is_paid,
        status=booking.status,
        created_at=booking.created_at,
        facility=FacilityResponse(
            id=facility.id,
            building_id=facility.building_id,
            name=facility.name,
            description=facility.description,
            location=facility.location,
            capacity=facility.capacity,
            booking_fee=facility.booking_fee,
            deposit_required=facility.deposit_required,
            min_booking_hours=facility.min_booking_hours,
            max_booking_hours=facility.max_booking_hours,
            advance_booking_days=facility.advance_booking_days,
            is_active=facility.is_active,
            created_at=facility.created_at
        ) if facility else None,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        ) if user else None
    )

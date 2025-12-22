"""
FixMyCondo - Dashboard API Routes
Statistics and analytics endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import (
    Complaint, User, Unit, Building, FacilityBooking,
    ComplaintStatus, ComplaintCategory, ComplaintPriority,
    BookingStatus, UserRole
)
from ..schemas import DashboardStats, ComplaintStats
from ..services import get_current_user, get_sla_compliance_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    building_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    # Determine building filter
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role != UserRole.SUPER_ADMIN and current_user.building_id:
        building_id = current_user.building_id
    
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    # Complaint stats
    complaint_filters = []
    if building_id:
        complaint_filters.append(Complaint.building_id == building_id)
    
    # Total complaints
    total_result = await db.execute(
        select(func.count(Complaint.id)).where(*complaint_filters) if complaint_filters 
        else select(func.count(Complaint.id))
    )
    total_complaints = total_result.scalar() or 0
    
    # New complaints (submitted status)
    new_filters = complaint_filters + [Complaint.status == ComplaintStatus.SUBMITTED]
    new_result = await db.execute(
        select(func.count(Complaint.id)).where(and_(*new_filters))
    )
    new_complaints = new_result.scalar() or 0
    
    # In progress complaints
    in_progress_statuses = [
        ComplaintStatus.ASSIGNED,
        ComplaintStatus.IN_PROGRESS,
        ComplaintStatus.PENDING_PARTS,
        ComplaintStatus.PENDING_VENDOR
    ]
    progress_filters = complaint_filters + [Complaint.status.in_(in_progress_statuses)]
    progress_result = await db.execute(
        select(func.count(Complaint.id)).where(and_(*progress_filters))
    )
    in_progress_complaints = progress_result.scalar() or 0
    
    # Overdue complaints
    overdue_filters = complaint_filters + [Complaint.is_sla_breached == True]
    overdue_result = await db.execute(
        select(func.count(Complaint.id)).where(and_(*overdue_filters))
    )
    overdue_complaints = overdue_result.scalar() or 0
    
    # Completed today
    completed_filters = complaint_filters + [
        Complaint.status.in_([ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]),
        Complaint.resolved_at >= today_start,
        Complaint.resolved_at <= today_end
    ]
    completed_result = await db.execute(
        select(func.count(Complaint.id)).where(and_(*completed_filters))
    )
    completed_today = completed_result.scalar() or 0
    
    # Resident/Unit stats
    unit_filters = []
    if building_id:
        unit_filters.append(Unit.building_id == building_id)
    
    total_units_result = await db.execute(
        select(func.count(Unit.id)).where(*unit_filters) if unit_filters 
        else select(func.count(Unit.id))
    )
    total_units = total_units_result.scalar() or 0
    
    occupied_filters = unit_filters + [Unit.is_occupied == True]
    occupied_result = await db.execute(
        select(func.count(Unit.id)).where(and_(*occupied_filters))
    )
    occupied_units = occupied_result.scalar() or 0
    
    # Resident count
    resident_filters = [User.role == UserRole.RESIDENT]
    if building_id:
        resident_filters.append(User.building_id == building_id)
    resident_result = await db.execute(
        select(func.count(User.id)).where(and_(*resident_filters))
    )
    total_residents = resident_result.scalar() or 0
    
    # Booking stats
    pending_bookings_result = await db.execute(
        select(func.count(FacilityBooking.id)).where(
            FacilityBooking.status == BookingStatus.PENDING
        )
    )
    pending_bookings = pending_bookings_result.scalar() or 0
    
    today_bookings_result = await db.execute(
        select(func.count(FacilityBooking.id)).where(
            and_(
                FacilityBooking.booking_date >= today_start,
                FacilityBooking.booking_date <= today_end,
                FacilityBooking.status == BookingStatus.CONFIRMED
            )
        )
    )
    today_bookings = today_bookings_result.scalar() or 0
    
    return DashboardStats(
        total_complaints=total_complaints,
        new_complaints=new_complaints,
        in_progress_complaints=in_progress_complaints,
        overdue_complaints=overdue_complaints,
        completed_today=completed_today,
        total_residents=total_residents,
        total_units=total_units,
        occupied_units=occupied_units,
        pending_bookings=pending_bookings,
        today_bookings=today_bookings
    )


@router.get("/complaint-stats", response_model=ComplaintStats)
async def get_complaint_stats(
    building_id: Optional[int] = None,
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed complaint statistics"""
    # Determine building filter
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role != UserRole.SUPER_ADMIN and current_user.building_id:
        building_id = current_user.building_id
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    base_filters = [Complaint.created_at >= start_date]
    if building_id:
        base_filters.append(Complaint.building_id == building_id)
    
    # Get complaints for analysis
    result = await db.execute(
        select(Complaint).where(and_(*base_filters))
    )
    complaints = result.scalars().all()
    
    # Analyze by category
    by_category = {}
    for cat in ComplaintCategory:
        count = sum(1 for c in complaints if c.category == cat)
        if count > 0:
            by_category[cat.value] = count
    
    # Analyze by status
    by_status = {}
    for status in ComplaintStatus:
        count = sum(1 for c in complaints if c.status == status)
        if count > 0:
            by_status[status.value] = count
    
    # Analyze by priority
    by_priority = {}
    for priority in ComplaintPriority:
        count = sum(1 for c in complaints if c.priority == priority)
        if count > 0:
            by_priority[priority.value] = count
    
    # Calculate average resolution time
    resolved_complaints = [
        c for c in complaints 
        if c.resolved_at and c.status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]
    ]
    
    if resolved_complaints:
        total_hours = sum(
            (c.resolved_at - c.created_at).total_seconds() / 3600 
            for c in resolved_complaints
        )
        avg_resolution_time = total_hours / len(resolved_complaints)
    else:
        avg_resolution_time = 0.0
    
    # Get SLA compliance
    sla_stats = await get_sla_compliance_stats(db, building_id)
    
    return ComplaintStats(
        by_category=by_category,
        by_status=by_status,
        by_priority=by_priority,
        avg_resolution_time_hours=round(avg_resolution_time, 2),
        sla_compliance_rate=sla_stats["compliance_rate"]
    )


@router.get("/technician-stats")
async def get_technician_stats(
    building_id: Optional[int] = None,
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get technician performance statistics"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get technicians
    tech_query = select(User).where(User.role == UserRole.TECHNICIAN)
    if building_id:
        tech_query = tech_query.where(User.building_id == building_id)
    
    tech_result = await db.execute(tech_query)
    technicians = tech_result.scalars().all()
    
    stats = []
    for tech in technicians:
        # Get assigned complaints
        complaint_result = await db.execute(
            select(Complaint).where(
                and_(
                    Complaint.assigned_to_id == tech.id,
                    Complaint.created_at >= start_date
                )
            )
        )
        complaints = complaint_result.scalars().all()
        
        total_assigned = len(complaints)
        completed = sum(
            1 for c in complaints 
            if c.status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]
        )
        breached = sum(1 for c in complaints if c.is_sla_breached)
        
        # Calculate average completion time
        resolved = [c for c in complaints if c.resolved_at]
        if resolved:
            avg_hours = sum(
                (c.resolved_at - c.created_at).total_seconds() / 3600 
                for c in resolved
            ) / len(resolved)
        else:
            avg_hours = 0
        
        stats.append({
            "id": tech.id,
            "name": tech.full_name or tech.email,
            "speciality": tech.speciality,
            "total_assigned": total_assigned,
            "completed": completed,
            "in_progress": total_assigned - completed,
            "sla_breached": breached,
            "completion_rate": round(completed / total_assigned * 100, 1) if total_assigned > 0 else 0,
            "avg_resolution_hours": round(avg_hours, 1)
        })
    
    # Sort by completion rate
    stats.sort(key=lambda x: x["completion_rate"], reverse=True)
    
    return {"technicians": stats}

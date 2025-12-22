"""
FixMyCondo - Complaints API Routes
Full CRUD operations for complaints with SLA tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime
import json

from ..database import get_db
from ..models import (
    Complaint, ComplaintUpdate as ComplaintUpdateModel, User, Unit,
    ComplaintStatus, ComplaintPriority, ComplaintCategory, UserRole
)
from ..schemas import (
    ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintListResponse,
    ComplaintUpdateCreate, ComplaintUpdateResponse,
    PaginatedResponse, UserResponse
)
from ..services import (
    get_current_user, require_admin, require_committee,
    calculate_sla_deadline, get_sla_hours, get_sla_status
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint_data: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new complaint/maintenance request"""
    # Determine building_id from user or unit
    building_id = current_user.building_id
    
    if complaint_data.unit_id:
        result = await db.execute(select(Unit).where(Unit.id == complaint_data.unit_id))
        unit = result.scalar_one_or_none()
        if unit:
            building_id = unit.building_id
    
    if not building_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine building for complaint"
        )
    
    # Calculate SLA
    sla_hours = get_sla_hours(complaint_data.priority)
    sla_deadline = calculate_sla_deadline(datetime.utcnow(), complaint_data.priority)
    
    # Create complaint
    complaint = Complaint(
        building_id=building_id,
        unit_id=complaint_data.unit_id or current_user.unit_id,
        title=complaint_data.title,
        description=complaint_data.description,
        category=complaint_data.category,
        priority=complaint_data.priority,
        status=ComplaintStatus.SUBMITTED,
        created_by_id=current_user.id,
        sla_hours=sla_hours,
        sla_deadline=sla_deadline,
        preferred_visit_time=complaint_data.preferred_visit_time,
        allow_technician_entry=complaint_data.allow_technician_entry,
        photos=json.dumps(complaint_data.photos) if complaint_data.photos else None,
        videos=json.dumps(complaint_data.videos) if complaint_data.videos else None
    )
    
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    
    # Load relationships
    result = await db.execute(
        select(Complaint)
        .options(selectinload(Complaint.created_by), selectinload(Complaint.assigned_to))
        .where(Complaint.id == complaint.id)
    )
    complaint = result.scalar_one()
    
    return _serialize_complaint(complaint)


@router.get("/", response_model=PaginatedResponse)
async def get_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ComplaintStatus] = None,
    category: Optional[ComplaintCategory] = None,
    priority: Optional[ComplaintPriority] = None,
    building_id: Optional[int] = None,
    assigned_to_me: bool = False,
    created_by_me: bool = False,
    is_overdue: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of complaints with filtering and pagination"""
    query = select(Complaint).options(
        selectinload(Complaint.created_by),
        selectinload(Complaint.assigned_to),
        selectinload(Complaint.unit)
    )
    
    # Apply filters
    filters = []
    
    # Role-based filtering
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role == UserRole.RESIDENT:
        # Residents can only see their own complaints
        filters.append(Complaint.created_by_id == current_user.id)
    elif user_role == UserRole.TECHNICIAN:
        # Technicians see assigned complaints or all if admin
        if assigned_to_me:
            filters.append(Complaint.assigned_to_id == current_user.id)
    elif current_user.building_id:
        # Building admins/committees see their building's complaints
        filters.append(Complaint.building_id == current_user.building_id)
    
    # Explicit filters
    if status:
        filters.append(Complaint.status == status)
    if category:
        filters.append(Complaint.category == category)
    if priority:
        filters.append(Complaint.priority == priority)
    if building_id and user_role == UserRole.SUPER_ADMIN:
        filters.append(Complaint.building_id == building_id)
    if created_by_me:
        filters.append(Complaint.created_by_id == current_user.id)
    if is_overdue is not None:
        filters.append(Complaint.is_sla_breached == is_overdue)
    if search:
        filters.append(
            or_(
                Complaint.title.ilike(f"%{search}%"),
                Complaint.description.ilike(f"%{search}%")
            )
        )
    
    if filters:
        query = query.where(and_(*filters))
    
    # Order by latest first
    query = query.order_by(Complaint.created_at.desc())
    
    # Get total count
    count_query = select(func.count(Complaint.id))
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    complaints = result.scalars().all()
    
    # Serialize items
    items = []
    for complaint in complaints:
        items.append({
            "id": complaint.id,
            "title": complaint.title,
            "category": complaint.category.value if complaint.category else None,
            "priority": complaint.priority.value if complaint.priority else None,
            "status": complaint.status.value if complaint.status else None,
            "unit_number": complaint.unit.unit_number if complaint.unit else None,
            "sla_deadline": complaint.sla_deadline.isoformat() if complaint.sla_deadline else None,
            "is_sla_breached": complaint.is_sla_breached,
            "created_at": complaint.created_at.isoformat()
        })
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific complaint by ID"""
    result = await db.execute(
        select(Complaint)
        .options(
            selectinload(Complaint.created_by),
            selectinload(Complaint.assigned_to),
            selectinload(Complaint.updates).selectinload(ComplaintUpdateModel.created_by)
        )
        .where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Check access permissions
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role == UserRole.RESIDENT and complaint.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return _serialize_complaint(complaint)


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: int,
    update_data: ComplaintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a complaint (status, assignment, etc.)"""
    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        setattr(complaint, field, value)
    
    # Handle status changes
    if update_data.status:
        if update_data.status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]:
            complaint.resolved_at = datetime.utcnow()
    
    # Recalculate SLA if priority changes
    if update_data.priority:
        complaint.sla_hours = get_sla_hours(update_data.priority)
        complaint.sla_deadline = calculate_sla_deadline(
            complaint.created_at, update_data.priority
        )
    
    complaint.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(complaint)
    
    # Reload with relationships
    result = await db.execute(
        select(Complaint)
        .options(selectinload(Complaint.created_by), selectinload(Complaint.assigned_to))
        .where(Complaint.id == complaint.id)
    )
    complaint = result.scalar_one()
    
    return _serialize_complaint(complaint)


@router.post("/{complaint_id}/updates", response_model=ComplaintUpdateResponse)
async def add_complaint_update(
    complaint_id: int,
    update_data: ComplaintUpdateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a timeline update to a complaint"""
    # Verify complaint exists
    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Create update
    complaint_update = ComplaintUpdateModel(
        complaint_id=complaint_id,
        created_by_id=current_user.id,
        message=update_data.message,
        status=update_data.status,
        cost_update=update_data.cost_update,
        photos=json.dumps(update_data.photos) if update_data.photos else None
    )
    
    # Update complaint status if provided
    if update_data.status:
        complaint.status = update_data.status
        if update_data.status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]:
            complaint.resolved_at = datetime.utcnow()
    
    if update_data.cost_update:
        complaint.actual_cost = (complaint.actual_cost or 0) + update_data.cost_update
    
    db.add(complaint_update)
    complaint.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(complaint_update)
    
    return ComplaintUpdateResponse(
        id=complaint_update.id,
        complaint_id=complaint_update.complaint_id,
        created_by_id=complaint_update.created_by_id,
        status=complaint_update.status.value if complaint_update.status else None,
        message=complaint_update.message,
        photos=json.loads(complaint_update.photos) if complaint_update.photos else None,
        cost_update=complaint_update.cost_update,
        created_at=complaint_update.created_at
    )


@router.get("/{complaint_id}/updates", response_model=List[ComplaintUpdateResponse])
async def get_complaint_updates(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get timeline updates for a complaint"""
    result = await db.execute(
        select(ComplaintUpdateModel)
        .options(selectinload(ComplaintUpdateModel.created_by))
        .where(ComplaintUpdateModel.complaint_id == complaint_id)
        .order_by(ComplaintUpdateModel.created_at.asc())
    )
    updates = result.scalars().all()
    
    return [
        ComplaintUpdateResponse(
            id=u.id,
            complaint_id=u.complaint_id,
            created_by_id=u.created_by_id,
            status=u.status.value if u.status else None,
            message=u.message,
            photos=json.loads(u.photos) if u.photos else None,
            cost_update=u.cost_update,
            created_at=u.created_at,
            created_by=UserResponse(
                id=u.created_by.id,
                email=u.created_by.email,
                full_name=u.created_by.full_name,
                phone=u.created_by.phone,
                role=u.created_by.role,
                is_active=u.created_by.is_active,
                is_verified=u.created_by.is_verified,
                created_at=u.created_by.created_at
            ) if u.created_by else None
        )
        for u in updates
    ]


@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a complaint (admin only)"""
    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    await db.delete(complaint)
    await db.commit()


def _serialize_complaint(complaint: Complaint) -> ComplaintResponse:
    """Helper to serialize complaint with nested objects"""
    return ComplaintResponse(
        id=complaint.id,
        building_id=complaint.building_id,
        unit_id=complaint.unit_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority,
        status=complaint.status,
        created_by_id=complaint.created_by_id,
        assigned_to_id=complaint.assigned_to_id,
        photos=json.loads(complaint.photos) if complaint.photos else None,
        videos=json.loads(complaint.videos) if complaint.videos else None,
        sla_hours=complaint.sla_hours,
        sla_deadline=complaint.sla_deadline,
        is_sla_breached=complaint.is_sla_breached,
        estimated_cost=complaint.estimated_cost or 0.0,
        actual_cost=complaint.actual_cost or 0.0,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
        created_by=UserResponse(
            id=complaint.created_by.id,
            email=complaint.created_by.email,
            full_name=complaint.created_by.full_name,
            phone=complaint.created_by.phone,
            role=complaint.created_by.role,
            is_active=complaint.created_by.is_active,
            is_verified=complaint.created_by.is_verified,
            created_at=complaint.created_by.created_at
        ) if complaint.created_by else None,
        assigned_to=UserResponse(
            id=complaint.assigned_to.id,
            email=complaint.assigned_to.email,
            full_name=complaint.assigned_to.full_name,
            phone=complaint.assigned_to.phone,
            role=complaint.assigned_to.role,
            is_active=complaint.assigned_to.is_active,
            is_verified=complaint.assigned_to.is_verified,
            created_at=complaint.assigned_to.created_at
        ) if complaint.assigned_to else None
    )

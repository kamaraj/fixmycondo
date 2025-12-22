"""
FixMyCondo - Buildings API Routes
Building and Unit management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List

from ..database import get_db
from ..models import Building, Unit, User, UserRole
from ..schemas import (
    BuildingCreate, BuildingUpdate, BuildingResponse,
    UnitCreate, UnitUpdate, UnitResponse,
    PaginatedResponse
)
from ..services import get_current_user, require_admin

router = APIRouter(prefix="/buildings", tags=["Buildings"])


# ============================================
# BUILDING ENDPOINTS
# ============================================

@router.post("/", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
async def create_building(
    building_data: BuildingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new building (admin only)"""
    building = Building(**building_data.model_dump())
    db.add(building)
    await db.commit()
    await db.refresh(building)
    return building


@router.get("/", response_model=PaginatedResponse)
async def get_buildings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of buildings with filtering"""
    query = select(Building)
    filters = []
    
    # Role-based filtering
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role != UserRole.SUPER_ADMIN and current_user.building_id:
        filters.append(Building.id == current_user.building_id)
    
    if search:
        filters.append(Building.name.ilike(f"%{search}%"))
    if city:
        filters.append(Building.city.ilike(f"%{city}%"))
    if is_active is not None:
        filters.append(Building.is_active == is_active)
    
    if filters:
        from sqlalchemy import and_
        query = query.where(and_(*filters))
    
    # Get total count
    count_result = await db.execute(select(func.count(Building.id)).where(*filters) if filters else select(func.count(Building.id)))
    total = count_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Building.name).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    buildings = result.scalars().all()
    
    items = [
        BuildingResponse(
            id=b.id,
            name=b.name,
            address=b.address,
            city=b.city,
            state=b.state,
            postal_code=b.postal_code,
            country=b.country,
            total_blocks=b.total_blocks,
            total_units=b.total_units,
            manager_name=b.manager_name,
            manager_email=b.manager_email,
            manager_phone=b.manager_phone,
            subscription_tier=b.subscription_tier,
            is_active=b.is_active,
            created_at=b.created_at
        )
        for b in buildings
    ]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{building_id}", response_model=BuildingResponse)
async def get_building(
    building_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific building by ID"""
    result = await db.execute(
        select(Building).where(Building.id == building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    return building


@router.patch("/{building_id}", response_model=BuildingResponse)
async def update_building(
    building_id: int,
    update_data: BuildingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a building (admin only)"""
    result = await db.execute(
        select(Building).where(Building.id == building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(building, field, value)
    
    await db.commit()
    await db.refresh(building)
    return building


@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_building(
    building_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a building (admin only)"""
    result = await db.execute(
        select(Building).where(Building.id == building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    await db.delete(building)
    await db.commit()


# ============================================
# UNIT ENDPOINTS
# ============================================

@router.post("/{building_id}/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(
    building_id: int,
    unit_data: UnitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new unit in a building"""
    # Verify building exists
    result = await db.execute(
        select(Building).where(Building.id == building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    unit = Unit(building_id=building_id, **unit_data.model_dump(exclude={'building_id'}))
    db.add(unit)
    
    # Update building unit count
    building.total_units += 1
    
    await db.commit()
    await db.refresh(unit)
    return unit


@router.get("/{building_id}/units", response_model=List[UnitResponse])
async def get_building_units(
    building_id: int,
    block: Optional[str] = None,
    floor: Optional[int] = None,
    is_occupied: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all units in a building"""
    query = select(Unit).where(Unit.building_id == building_id)
    
    if block:
        query = query.where(Unit.block == block)
    if floor:
        query = query.where(Unit.floor == floor)
    if is_occupied is not None:
        query = query.where(Unit.is_occupied == is_occupied)
    
    query = query.order_by(Unit.block, Unit.floor, Unit.unit_number)
    
    result = await db.execute(query)
    units = result.scalars().all()
    
    return units


@router.get("/units/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific unit by ID"""
    result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    return unit


@router.patch("/units/{unit_id}", response_model=UnitResponse)
async def update_unit(
    unit_id: int,
    update_data: UnitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a unit (admin only)"""
    result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(unit, field, value)
    
    await db.commit()
    await db.refresh(unit)
    return unit


@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a unit (admin only)"""
    result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Update building unit count
    building_result = await db.execute(
        select(Building).where(Building.id == unit.building_id)
    )
    building = building_result.scalar_one_or_none()
    if building:
        building.total_units = max(0, building.total_units - 1)
    
    await db.delete(unit)
    await db.commit()

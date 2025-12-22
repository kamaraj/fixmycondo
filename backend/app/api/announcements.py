"""
FixMyCondo - Announcements API Routes
Building announcements and notifications
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import Optional, List
from datetime import datetime
import json

from ..database import get_db
from ..models import Announcement, Building, User, UserRole
from ..schemas import (
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    PaginatedResponse
)
from ..services import get_current_user, require_admin, require_committee

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_committee)
):
    """Create a new announcement"""
    # Verify building exists
    result = await db.execute(
        select(Building).where(Building.id == announcement_data.building_id)
    )
    building = result.scalar_one_or_none()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    
    announcement = Announcement(
        building_id=announcement_data.building_id,
        title=announcement_data.title,
        content=announcement_data.content,
        target_audience=json.dumps(announcement_data.target_audience) if announcement_data.target_audience else None,
        attachments=json.dumps(announcement_data.attachments) if announcement_data.attachments else None,
        send_push=announcement_data.send_push,
        send_email=announcement_data.send_email,
        send_whatsapp=announcement_data.send_whatsapp,
        is_published=False
    )
    
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    
    return _serialize_announcement(announcement)


@router.get("/", response_model=PaginatedResponse)
async def get_announcements(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    building_id: Optional[int] = None,
    is_published: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of announcements"""
    query = select(Announcement)
    filters = []
    
    # Role-based filtering
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role != UserRole.SUPER_ADMIN:
        if current_user.building_id:
            filters.append(Announcement.building_id == current_user.building_id)
        # Residents only see published announcements
        if user_role == UserRole.RESIDENT:
            filters.append(Announcement.is_published == True)
    elif building_id:
        filters.append(Announcement.building_id == building_id)
    
    if is_published is not None:
        filters.append(Announcement.is_published == is_published)
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.order_by(Announcement.created_at.desc())
    
    # Get total count
    count_query = select(func.count(Announcement.id))
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    announcements = result.scalars().all()
    
    items = [_serialize_announcement(a) for a in announcements]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific announcement"""
    result = await db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check access for residents
    user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
    
    if user_role == UserRole.RESIDENT and not announcement.is_published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return _serialize_announcement(announcement)


@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    update_data: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_committee)
):
    """Update an announcement"""
    result = await db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        setattr(announcement, field, value)
    
    # Set published_at if publishing
    if update_data.is_published and not announcement.published_at:
        announcement.published_at = datetime.utcnow()
    
    announcement.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(announcement)
    
    return _serialize_announcement(announcement)


@router.post("/{announcement_id}/publish", response_model=AnnouncementResponse)
async def publish_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_committee)
):
    """Publish an announcement"""
    result = await db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    if announcement.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Announcement is already published"
        )
    
    announcement.is_published = True
    announcement.published_at = datetime.utcnow()
    
    # TODO: Trigger notifications based on send_push, send_email, send_whatsapp
    # This would integrate with Redis queue for async processing
    
    await db.commit()
    await db.refresh(announcement)
    
    return _serialize_announcement(announcement)


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete an announcement (admin only)"""
    result = await db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    await db.delete(announcement)
    await db.commit()


def _serialize_announcement(announcement: Announcement) -> AnnouncementResponse:
    """Helper to serialize announcement"""
    return AnnouncementResponse(
        id=announcement.id,
        building_id=announcement.building_id,
        title=announcement.title,
        content=announcement.content,
        target_audience=json.loads(announcement.target_audience) if announcement.target_audience else None,
        attachments=json.loads(announcement.attachments) if announcement.attachments else None,
        is_published=announcement.is_published,
        published_at=announcement.published_at,
        created_at=announcement.created_at
    )

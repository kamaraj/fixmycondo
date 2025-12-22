"""
FixMyCondo - Vendors API Routes
Vendor management and quote handling
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import Optional, List

from ..database import get_db
from ..models import Vendor, VendorQuote, Complaint, User, VendorQuoteStatus, UserRole
from ..schemas import (
    VendorCreate, VendorUpdate, VendorResponse,
    VendorQuoteCreate, VendorQuoteUpdate, VendorQuoteResponse,
    PaginatedResponse
)
from ..services import get_current_user, require_admin, require_committee

router = APIRouter(prefix="/vendors", tags=["Vendors"])


# ============================================
# VENDOR ENDPOINTS
# ============================================

@router.post("/", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new vendor (admin only)"""
    vendor = Vendor(**vendor_data.model_dump())
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("/", response_model=PaginatedResponse)
async def get_vendors(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service_type: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_active: bool = True,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of vendors with filtering"""
    query = select(Vendor)
    filters = [Vendor.is_active == is_active]
    
    if service_type:
        filters.append(Vendor.service_type.ilike(f"%{service_type}%"))
    if is_verified is not None:
        filters.append(Vendor.is_verified == is_verified)
    if search:
        filters.append(
            Vendor.name.ilike(f"%{search}%") | 
            Vendor.company_name.ilike(f"%{search}%")
        )
    
    query = query.where(and_(*filters))
    
    # Get total count
    count_result = await db.execute(
        select(func.count(Vendor.id)).where(and_(*filters))
    )
    total = count_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(Vendor.rating.desc(), Vendor.name).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    vendors = result.scalars().all()
    
    items = [
        VendorResponse(
            id=v.id,
            name=v.name,
            company_name=v.company_name,
            email=v.email,
            phone=v.phone,
            service_type=v.service_type,
            license_number=v.license_number,
            insurance_valid_until=v.insurance_valid_until,
            rating=v.rating,
            total_jobs=v.total_jobs,
            completed_jobs=v.completed_jobs,
            is_verified=v.is_verified,
            is_active=v.is_active,
            created_at=v.created_at
        )
        for v in vendors
    ]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific vendor"""
    result = await db.execute(
        select(Vendor).where(Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: int,
    update_data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a vendor (admin only)"""
    result = await db.execute(
        select(Vendor).where(Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(vendor, field, value)
    
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a vendor (admin only)"""
    result = await db.execute(
        select(Vendor).where(Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    await db.delete(vendor)
    await db.commit()


# ============================================
# VENDOR QUOTE ENDPOINTS
# ============================================

@router.post("/quotes", response_model=VendorQuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor_quote(
    quote_data: VendorQuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_committee)
):
    """Create a vendor quote for a complaint"""
    # Verify complaint exists
    complaint_result = await db.execute(
        select(Complaint).where(Complaint.id == quote_data.complaint_id)
    )
    complaint = complaint_result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Verify vendor exists
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == quote_data.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    # Create quote
    quote = VendorQuote(**quote_data.model_dump())
    db.add(quote)
    
    # Update vendor total jobs
    vendor.total_jobs += 1
    
    await db.commit()
    await db.refresh(quote)
    
    return VendorQuoteResponse(
        id=quote.id,
        complaint_id=quote.complaint_id,
        vendor_id=quote.vendor_id,
        amount=quote.amount,
        currency=quote.currency,
        description=quote.description,
        estimated_days=quote.estimated_days,
        quote_document=quote.quote_document,
        status=quote.status,
        created_at=quote.created_at,
        vendor=VendorResponse(
            id=vendor.id,
            name=vendor.name,
            company_name=vendor.company_name,
            email=vendor.email,
            phone=vendor.phone,
            service_type=vendor.service_type,
            rating=vendor.rating,
            total_jobs=vendor.total_jobs,
            completed_jobs=vendor.completed_jobs,
            is_verified=vendor.is_verified,
            is_active=vendor.is_active,
            created_at=vendor.created_at
        )
    )


@router.get("/quotes/complaint/{complaint_id}", response_model=List[VendorQuoteResponse])
async def get_complaint_quotes(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all vendor quotes for a complaint"""
    result = await db.execute(
        select(VendorQuote)
        .options(selectinload(VendorQuote.vendor))
        .where(VendorQuote.complaint_id == complaint_id)
        .order_by(VendorQuote.amount)
    )
    quotes = result.scalars().all()
    
    return [
        VendorQuoteResponse(
            id=q.id,
            complaint_id=q.complaint_id,
            vendor_id=q.vendor_id,
            amount=q.amount,
            currency=q.currency,
            description=q.description,
            estimated_days=q.estimated_days,
            quote_document=q.quote_document,
            status=q.status,
            created_at=q.created_at,
            vendor=VendorResponse(
                id=q.vendor.id,
                name=q.vendor.name,
                company_name=q.vendor.company_name,
                email=q.vendor.email,
                phone=q.vendor.phone,
                service_type=q.vendor.service_type,
                rating=q.vendor.rating,
                total_jobs=q.vendor.total_jobs,
                completed_jobs=q.vendor.completed_jobs,
                is_verified=q.vendor.is_verified,
                is_active=q.vendor.is_active,
                created_at=q.vendor.created_at
            ) if q.vendor else None
        )
        for q in quotes
    ]


@router.patch("/quotes/{quote_id}", response_model=VendorQuoteResponse)
async def update_quote_status(
    quote_id: int,
    update_data: VendorQuoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_committee)
):
    """Update vendor quote status (approve/reject)"""
    result = await db.execute(
        select(VendorQuote)
        .options(selectinload(VendorQuote.vendor))
        .where(VendorQuote.id == quote_id)
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quote not found"
        )
    
    quote.status = update_data.status
    
    # If approved, update complaint estimated cost
    if update_data.status == VendorQuoteStatus.APPROVED:
        complaint_result = await db.execute(
            select(Complaint).where(Complaint.id == quote.complaint_id)
        )
        complaint = complaint_result.scalar_one_or_none()
        if complaint:
            complaint.estimated_cost = quote.amount
        
        # Update vendor completed jobs on completion
        quote.vendor.completed_jobs += 1
    
    await db.commit()
    await db.refresh(quote)
    
    return VendorQuoteResponse(
        id=quote.id,
        complaint_id=quote.complaint_id,
        vendor_id=quote.vendor_id,
        amount=quote.amount,
        currency=quote.currency,
        description=quote.description,
        estimated_days=quote.estimated_days,
        quote_document=quote.quote_document,
        status=quote.status,
        created_at=quote.created_at,
        vendor=VendorResponse(
            id=quote.vendor.id,
            name=quote.vendor.name,
            company_name=quote.vendor.company_name,
            email=quote.vendor.email,
            phone=quote.vendor.phone,
            service_type=quote.vendor.service_type,
            rating=quote.vendor.rating,
            total_jobs=quote.vendor.total_jobs,
            completed_jobs=quote.vendor.completed_jobs,
            is_verified=quote.vendor.is_verified,
            is_active=quote.vendor.is_active,
            created_at=quote.vendor.created_at
        ) if quote.vendor else None
    )

"""
FixMyCondo - SLA Engine
Service Level Agreement calculation and monitoring
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..config import settings
from ..models import Complaint, ComplaintPriority, ComplaintStatus


def get_sla_hours(priority: ComplaintPriority) -> int:
    """Get SLA hours based on priority level"""
    sla_mapping = {
        ComplaintPriority.LOW: settings.SLA_LOW_PRIORITY,
        ComplaintPriority.MEDIUM: settings.SLA_MEDIUM_PRIORITY,
        ComplaintPriority.HIGH: settings.SLA_HIGH_PRIORITY,
        ComplaintPriority.CRITICAL: settings.SLA_CRITICAL_PRIORITY
    }
    return sla_mapping.get(priority, settings.SLA_MEDIUM_PRIORITY)


def calculate_sla_deadline(created_at: datetime, priority: ComplaintPriority) -> datetime:
    """Calculate SLA deadline based on creation time and priority"""
    sla_hours = get_sla_hours(priority)
    return created_at + timedelta(hours=sla_hours)


def is_sla_breached(sla_deadline: datetime, resolved_at: Optional[datetime] = None) -> bool:
    """Check if SLA has been breached"""
    check_time = resolved_at or datetime.utcnow()
    return check_time > sla_deadline


def get_remaining_sla_time(sla_deadline: datetime) -> timedelta:
    """Get remaining time until SLA breach"""
    remaining = sla_deadline - datetime.utcnow()
    return remaining if remaining.total_seconds() > 0 else timedelta(0)


def get_sla_status(sla_deadline: datetime, status: ComplaintStatus) -> dict:
    """Get comprehensive SLA status information"""
    now = datetime.utcnow()
    
    # If complaint is resolved, use resolved status
    if status in [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]:
        return {
            "status": "completed",
            "is_breached": False,
            "remaining_hours": 0,
            "remaining_minutes": 0,
            "urgency": "none"
        }
    
    remaining = sla_deadline - now
    total_seconds = remaining.total_seconds()
    
    if total_seconds <= 0:
        return {
            "status": "breached",
            "is_breached": True,
            "overdue_hours": abs(total_seconds) / 3600,
            "urgency": "critical"
        }
    
    remaining_hours = total_seconds / 3600
    
    # Determine urgency level
    if remaining_hours <= 4:
        urgency = "critical"
    elif remaining_hours <= 12:
        urgency = "high"
    elif remaining_hours <= 24:
        urgency = "medium"
    else:
        urgency = "low"
    
    return {
        "status": "active",
        "is_breached": False,
        "remaining_hours": int(remaining_hours),
        "remaining_minutes": int((remaining_hours % 1) * 60),
        "deadline": sla_deadline.isoformat(),
        "urgency": urgency
    }


async def check_and_update_sla_breaches(db: AsyncSession) -> int:
    """
    Background task to check and update SLA breach status for all open complaints
    Returns count of newly breached complaints
    """
    now = datetime.utcnow()
    
    # Get all open complaints where SLA might be breached but not yet marked
    result = await db.execute(
        select(Complaint).where(
            and_(
                Complaint.status.not_in([
                    ComplaintStatus.COMPLETED,
                    ComplaintStatus.CLOSED,
                    ComplaintStatus.CANCELLED
                ]),
                Complaint.is_sla_breached == False,
                Complaint.sla_deadline < now
            )
        )
    )
    
    complaints = result.scalars().all()
    breach_count = 0
    
    for complaint in complaints:
        complaint.is_sla_breached = True
        breach_count += 1
    
    if breach_count > 0:
        await db.commit()
    
    return breach_count


async def get_sla_compliance_stats(db: AsyncSession, building_id: Optional[int] = None) -> dict:
    """Get SLA compliance statistics"""
    from sqlalchemy import func
    
    base_query = select(Complaint)
    
    if building_id:
        base_query = base_query.where(Complaint.building_id == building_id)
    
    # Get total resolved complaints
    resolved_statuses = [ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED]
    
    total_result = await db.execute(
        base_query.where(Complaint.status.in_(resolved_statuses))
    )
    total_resolved = len(total_result.scalars().all())
    
    # Get complaints resolved within SLA
    on_time_result = await db.execute(
        base_query.where(
            and_(
                Complaint.status.in_(resolved_statuses),
                Complaint.is_sla_breached == False
            )
        )
    )
    on_time_count = len(on_time_result.scalars().all())
    
    # Calculate compliance rate
    compliance_rate = (on_time_count / total_resolved * 100) if total_resolved > 0 else 100.0
    
    return {
        "total_resolved": total_resolved,
        "resolved_on_time": on_time_count,
        "resolved_late": total_resolved - on_time_count,
        "compliance_rate": round(compliance_rate, 2)
    }

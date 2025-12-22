"""
FixMyCondo - Services Package
"""
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    create_tokens,
    decode_token,
    get_current_user,
    get_current_active_user,
    require_roles,
    require_admin,
    require_committee,
    require_technician,
    require_resident
)

from .sla_engine import (
    get_sla_hours,
    calculate_sla_deadline,
    is_sla_breached,
    get_remaining_sla_time,
    get_sla_status,
    check_and_update_sla_breaches,
    get_sla_compliance_stats
)

__all__ = [
    # Auth
    "hash_password",
    "verify_password", 
    "create_access_token",
    "create_refresh_token",
    "create_tokens",
    "decode_token",
    "get_current_user",
    "get_current_active_user",
    "require_roles",
    "require_admin",
    "require_committee",
    "require_technician",
    "require_resident",
    # SLA
    "get_sla_hours",
    "calculate_sla_deadline",
    "is_sla_breached",
    "get_remaining_sla_time",
    "get_sla_status",
    "check_and_update_sla_breaches",
    "get_sla_compliance_stats"
]

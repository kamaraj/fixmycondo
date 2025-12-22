"""
FixMyCondo - Authentication Service
JWT token generation and password hashing
"""
from datetime import datetime, timedelta
from typing import Optional, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..config import settings
from ..database import get_db
from ..models import User, UserRole
from ..schemas import TokenPayload

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_tokens(user: User) -> dict:
    """Create both access and refresh tokens for a user"""
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value if isinstance(user.role, UserRole) else user.role
    }
    
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer"
    }


def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return TokenPayload(
            sub=int(payload.get("sub")),
            email=payload.get("email"),
            role=payload.get("role"),
            exp=datetime.fromtimestamp(payload.get("exp"))
        )
    except JWTError:
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    # Check if token is expired
    if payload.exp < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Get user from database
    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_roles(*roles: UserRole):
    """Dependency factory for role-based access control"""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role if isinstance(current_user.role, UserRole) else UserRole(current_user.role)
        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}"
            )
        return current_user
    return role_checker


# Pre-defined role dependencies
require_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN)
require_committee = require_roles(UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN, UserRole.COMMITTEE)
require_technician = require_roles(UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN, UserRole.TECHNICIAN)
require_resident = require_roles(UserRole.SUPER_ADMIN, UserRole.BUILDING_ADMIN, UserRole.COMMITTEE, UserRole.RESIDENT)

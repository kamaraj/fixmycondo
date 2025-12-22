"""
FixMyCondo - Authentication API Routes
Login, Register, Token Refresh
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from ..database import get_db
from ..models import User, UserRole
from ..schemas import (
    TokenSchema, LoginRequest, RegisterRequest, 
    UserResponse, UserCreate, UserUpdate, PasswordChange,
    ResidenceResponse
)
from ..services import (
    hash_password, verify_password, create_tokens,
    decode_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account"""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        phone=request.phone,
        role=request.role,
        building_id=request.building_id,
        unit_id=request.unit_id
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/login", response_model=TokenSchema)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login with email and password"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Generate tokens
    return create_tokens(user)


@router.post("/login/form", response_model=TokenSchema)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login using OAuth2 password form (for Swagger UI)"""
    # Find user by email (username field)
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return create_tokens(user)


@router.post("/refresh", response_model=TokenSchema)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token"""
    payload = decode_token(refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify user still exists and is active
    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return create_tokens(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information"""
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    # Restrict what users can update
    # Users cannot update their role or active status via this endpoint
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    
    # Technician speciality
    if update_data.speciality is not None and current_user.role == UserRole.TECHNICIAN:
        current_user.speciality = update_data.speciality
    
    if update_data.settings is not None:
        current_user.settings = update_data.settings
        
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/password")
async def change_password(
    password_data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change current user password"""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.hashed_password = hash_password(password_data.new_password)
    await db.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """Logout current user (client should discard tokens)"""
    # In a stateless JWT system, logout is handled client-side
    # For enhanced security, implement token blacklist with Redis
    return {"message": "Successfully logged out"}


@router.get("/residence", response_model=ResidenceResponse)
async def get_my_residence(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's residence (building & unit) details"""
    if not current_user.building_id or not current_user.unit_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with any building or unit"
        )
    
    # Fetch building and unit
    from ..models import Building, Unit
    building_result = await db.execute(select(Building).where(Building.id == current_user.building_id))
    building = building_result.scalar_one_or_none()
    
    unit_result = await db.execute(select(Unit).where(Unit.id == current_user.unit_id))
    unit = unit_result.scalar_one_or_none()
    
    if not building or not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building or Unit record missing"
        )
    
    return ResidenceResponse(
        building_name=building.name,
        building_address=building.address,
        unit_number=unit.unit_number,
        block=unit.block,
        floor=unit.floor,
        unit_type=unit.unit_type,
        is_owner=True, # Assuming owner for now, can be refined based on user data
        building_manager=building.manager_name,
        manager_phone=building.manager_phone
    )

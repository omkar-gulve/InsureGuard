from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from database import get_db
import models
import schemas
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/members", response_model=List[schemas.UserWithStats])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(models.User).all()
    result = []
    for u in users:
        claims_count = db.query(models.Claim).filter(models.Claim.agent_id == u.id).count()
        u_dict = u.__dict__.copy()
        u_dict["claims_count"] = claims_count
        result.append(u_dict)
    return result

@router.put("/me", response_model=schemas.UserUpdateResponse)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user_to_update = current_user
    
    if user_update.username:
        user_to_update.username = user_update.username
    if user_update.email:
        user_to_update.email = user_update.email
    if user_update.password:
        user_to_update.hashed_password = get_password_hash(user_update.password)
    
    # Handle new profile fields
    if user_update.full_name is not None:
        user_to_update.full_name = user_update.full_name
    if user_update.phone_number is not None:
        user_to_update.phone_number = user_update.phone_number
    if user_update.profile_image_url is not None:
        user_to_update.profile_image_url = user_update.profile_image_url
        
    db.commit()
    db.refresh(user_to_update)
    return user_to_update

@router.put("/users/{user_id}", response_model=schemas.UserUpdateResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_to_update = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.username:
        user_to_update.username = user_update.username
    if user_update.email:
        user_to_update.email = user_update.email
    if user_update.password:
        user_to_update.hashed_password = get_password_hash(user_update.password)
    
    # Handle new profile fields
    if user_update.full_name is not None:
        user_to_update.full_name = user_update.full_name
    if user_update.phone_number is not None:
        user_to_update.phone_number = user_update.phone_number
    if user_update.profile_image_url is not None:
        user_to_update.profile_image_url = user_update.profile_image_url
        
    db.commit()
    db.refresh(user_to_update)
    return user_to_update

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user_to_delete)
    db.commit()
    return {"detail": "User deleted successfully"}

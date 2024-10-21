from datetime import datetime
from sqlite3 import IntegrityError
from fastapi import APIRouter, HTTPException, Depends, Body, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session
from deps import get_session
from security import AuthHandler, Token, get_current_user
from models.user import LogUserProfile, UserCreate, LogUserLogin, UpdateUserResponse, UserProfile, DeleteResponse, UserAuthen, UserUpdatePassword, UserUpdateProfile

router = APIRouter(tags=["Authentication"])
auth_handler = AuthHandler()

@router.post("/register", response_model=UserAuthen)
async def register_user(user: UserCreate, session: Session = Depends(get_session)):
    role = user.role or "user"
    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    hashed_password = auth_handler.get_password_hash(user.password)

    db_user = UserProfile(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=hashed_password,
        role=user.role
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    log_entry = LogUserProfile(
        action_name="insert",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=db_user.user_id,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        email=db_user.email,
        contact_number=db_user.contact_number,
        password=db_user.password,
        role=db_user.role
    )

    session.add(log_entry)
    session.commit()

    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.query(UserProfile).filter(UserProfile.email == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not auth_handler.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = auth_handler.create_access_token(data={"username": user.email, "role": user.role})

    log_entry = LogUserLogin(
        action_name="Login",
        login_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        access_token=access_token,
        role=user.role
    )

    db.add(log_entry)
    db.commit()

    return Token(access_token=access_token, token_type="bearer")

@router.post("/logout")
async def logout(current_user_email: str = Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_entry = LogUserLogin(
        action_name="Logout",
        login_datetime=datetime.now().replace(microsecond=0),  
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        access_token="",  
        role=user.role
    )

    session.add(log_entry)
    session.commit()

    return {"detail": "Successfully logged out"}




@router.put("/profile", response_model=UpdateUserResponse)
async def update_user_profile(
    update_data: UserUpdateProfile = Body(...),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_entry = LogUserProfile(
        action_name="update",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role
    )

    # Update the fields if provided
    if update_data.first_name:
        log_entry.to_first_name = update_data.first_name
        user.first_name = update_data.first_name
    if update_data.last_name:
        log_entry.to_last_name = update_data.last_name
        user.last_name = update_data.last_name
    if update_data.contact_number:
        log_entry.to_contact_number = update_data.contact_number
        user.contact_number = update_data.contact_number

    session.add(log_entry)
    session.add(user)
    session.commit()
    session.refresh(user)

    return UpdateUserResponse(
        status="User updated successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )


@router.put("/password", response_model=UpdateUserResponse)
async def update_user_password(
    update_data: UserUpdatePassword = Body(...),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_entry = LogUserProfile(
        action_name="update_password",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role
    )

    # Update password if provided
    if update_data.password:
        new_hashed_password = auth_handler.get_password_hash(update_data.password)
        log_entry.to_password = new_hashed_password
        user.password = new_hashed_password

    session.add(log_entry)
    session.add(user)
    session.commit()
    session.refresh(user)

    return UpdateUserResponse(
        status="Password updated successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )



@router.delete("/delete", response_model=DeleteResponse)
async def delete_user(
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_entry = LogUserProfile(
        action_name="delete",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role
    )

    delete_response = DeleteResponse(
        status="User deleted successfully",
        id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )

    session.add(log_entry)
    session.delete(user)
    session.commit()
    
    return delete_response

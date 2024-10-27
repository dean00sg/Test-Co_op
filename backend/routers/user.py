from datetime import datetime
from sqlite3 import IntegrityError
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from deps import get_session
from security import AuthHandler, Token, get_current_user
from models.user import LogUserProfile, LogUserLogin, UserProfile,UserCreate

router = APIRouter(tags=["Authentication"])
auth_handler = AuthHandler()

@router.post("/register", response_model=UserCreate)
async def register_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    contact_number: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),  # Optional
    image_profile: UploadFile = File(None),  # Accept file upload
    session: Session = Depends(get_session)
):
    # role = role or "user"
    # if role not in ["admin", "user"]:
    #     raise HTTPException(status_code=400, detail="Invalid role")

    hashed_password = auth_handler.get_password_hash(password)

  
    if image_profile:
        # Read the image as bytes
        image_profile_bytes = await image_profile.read() 

    db_user = UserProfile(
        image_profile=image_profile_bytes,  # Save the binary data
        first_name=first_name,
        last_name=last_name,
        email=email,
        contact_number=contact_number,
        password=hashed_password,
        role=role
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    # Log the registration entry
    log_entry = LogUserProfile(
        action_name="insert",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=db_user.user_id,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        email=db_user.email,
        contact_number=db_user.contact_number,
        password=db_user.password,
        role=db_user.role,
        image_profile=image_profile_bytes 
    )

    session.add(log_entry)
    session.commit()

    return db_user






@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
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

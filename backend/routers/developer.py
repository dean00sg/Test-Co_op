from datetime import datetime
from io import BytesIO
from typing import Dict, List, Optional
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session
from deps import get_session
from security import AuthHandler, get_current_user_developer
from models.user import  LogUserLogin, LogUserProfile, UserLogin, UserProfile

router = APIRouter(tags=["Developer"])
auth_handler = AuthHandler()


@router.get("/image_profile/{user_id}")
async def get_user_image_by_id(
    user_id: int, 
    session: Session = Depends(get_session), 
    role: str = Depends(get_current_user_developer)  # Check for developer role
):
    user = session.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.image_profile is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(user.image_profile)
    return StreamingResponse(image_stream, media_type="image/jpeg")  

@router.get("/log_image_profile/{log_id}")
async def get_log_image_by_id(
    log_id: int, 
    session: Session = Depends(get_session), 
    role: str = Depends(get_current_user_developer)  # Check for developer role
):
    user = session.query(LogUserProfile).filter(LogUserProfile.id == log_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.image_profile is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(user.image_profile)
    return StreamingResponse(image_stream, media_type="image/jpeg")  


@router.get("/check_login_logout/{user_id}", response_model=Dict[str, Optional[UserLogin]])
async def get_latest_user_login_logout(
    user_id: int,
    current_user_role: str = Depends(get_current_user_developer),  # Ensure only developers can access this
    session: Session = Depends(get_session)
):
    # Get the most recent login entry for the specified user
    latest_login = session.query(LogUserLogin).filter(
        LogUserLogin.user_id == user_id,
        LogUserLogin.action_name == "Login"
    ).order_by(LogUserLogin.login_datetime.desc()).first()

    # Get the most recent logout entry for the specified user
    latest_logout = session.query(LogUserLogin).filter(
        LogUserLogin.user_id == user_id,
        LogUserLogin.action_name == "Logout"
    ).order_by(LogUserLogin.login_datetime.desc()).first()

    # Prepare the response dictionary
    response = {
        "latest_login": latest_login,
        "latest_logout": latest_logout
    }

    return response
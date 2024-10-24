from datetime import datetime
from io import BytesIO
from typing import Dict, List, Optional
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile,status
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session
from models.news import LogNewsUpdate, News, NewsResponse, NewsStatus, NewsStatusUpdate, NewsUpdate
from deps import get_session
from security import AuthHandler, get_current_user, get_current_user_developer
from models.user import  LogUserLogin, LogUserProfile, UserLogin, UserProfile, UserResponse

router = APIRouter(tags=["Developer"])
auth_handler = AuthHandler()



@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile_by_id(
    user_id: int,
    session: Session = Depends(get_session),
    role: str = Depends(get_current_user_developer)
):
    # Fetch the user profile from the database using the provided user_id
    user = session.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user profile details
    return UserResponse(
        status="User profile retrieved successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )


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

    # Prepare the response dictionary based on the ID ordering
    response = {}
    
    if latest_login and latest_logout:
        if latest_login.id < latest_logout.id:
            response = {
                "latest_login": latest_login,
                "latest_logout": latest_logout
            }
        else:
            response = {
                "latest_logout": latest_logout,
                "latest_login": latest_login
            }
    elif latest_login:
        response = {
            "latest_login": latest_login,
            "latest_logout": None
        }
    elif latest_logout:
        response = {
            "latest_logout": latest_logout,
            "latest_login": None
        }
    else:
        response = {
            "latest_login": None,
            "latest_logout": None
        }

    return response


from fastapi import HTTPException, status

@router.put("/news/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    status_approve: str,
    session: Session = Depends(get_session),
    current_user_role: str = Depends(get_current_user_developer),
    username: str = Depends(get_current_user)
):
    news = session.query(News).filter(News.news_id == news_id).first()
    log_news = session.query(LogNewsUpdate).filter(LogNewsUpdate.news_id == news_id, LogNewsUpdate.action_name == "create").first()
    user_profile_request = session.query(UserProfile).filter(LogNewsUpdate.user_id == UserProfile.user_id).first()
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Check if log_news exists
    if not log_news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log entry for news not found")

    # Log the update action in LogNews
    log_news_status = NewsStatus(
        news_id=news.news_id,
        header=news.header,
        detail=news.detail,
        link=news.link,
        image_news=news.image_news,
        status_approve=news.status_approve,
        request_datetime=news.datetime,
        request_byid=log_news.user_id,  # This is now safe to access
        request_byname=f"{user_profile_request.first_name} {user_profile_request.last_name}" if user_profile_request else "Unknown",
        request_byrole=log_news.role,
        to_status_approve=status_approve,
        approve_datetime=datetime.now().replace(microsecond=0),
        approve_byid=user_profile.user_id,
        approve_byname=f"{user_profile.first_name} {user_profile.last_name}",
        approve_byrole=user_profile.role
    )
    
    session.add(log_news_status)
    session.commit()

    # Update News entry
    news.status_approve = status_approve if status_approve else news.status_approve
    session.commit()

    return news

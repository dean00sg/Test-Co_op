from datetime import datetime
from io import BytesIO
from typing import Dict, List, Optional
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile,status
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session
from models.news import LogNewsUpdate, News, NewsResponse, NewsStatus, NewsStatusResponse, NewsStatusUpdate, NewsUpdate
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





@router.put("/news/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    status_approve: str,
    session: Session = Depends(get_session),
    current_user_role: str = Depends(get_current_user_developer),
    username: str = Depends(get_current_user)
):
    # Query the news record
    news = session.query(News).filter(News.news_id == news_id).first()
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Query the log entry for the news
    log_news = session.query(LogNewsUpdate).filter(LogNewsUpdate.news_id == news_id, LogNewsUpdate.action_name == "create").first()
    if not log_news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log entry for news not found")

    # Query the user profile based on username
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()
    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    # Query the existing NewsStatus record
    news_status = session.query(NewsStatus).filter(NewsStatus.news_id == news_id).first()
    if not news_status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News status not found")

    # Update the fields in the existing NewsStatus record
    news_status.to_status_approve = status_approve
    news_status.approve_datetime = datetime.now().replace(microsecond=0)
    news_status.approve_byid = user_profile.user_id
    news_status.approve_byname = f"{user_profile.first_name} {user_profile.last_name}"
    news_status.approve_byrole = user_profile.role
    
    # Commit the changes to NewsStatus
    session.commit()

    # Update the status_approve field in the News record
    news.status_approve = status_approve if status_approve else news.status_approve
    
    # Commit the changes to News
    session.commit()

    return news









































@router.get("/log_image_status/{status_id}")
async def getlog_image_status_by_id(
    status_id: int, 
    session: Session = Depends(get_session), 
    current_user_role: str = Depends(get_current_user_developer),
    
):
    news = session.query(NewsStatus).filter(NewsStatus.status_id == status_id).first()
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if news.image_news is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(news.image_news)
    return StreamingResponse(image_stream, media_type="image/jpeg")  # You can adjust the media type as needed


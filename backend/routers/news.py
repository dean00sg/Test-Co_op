from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from models.user import LogUserProfile, UserProfile
from models.news import LogNewsUpdate, LogNewsUpdateResponse, NewsResponse, NewsStatus, NewsStatusResponse, NewsUpdate, News
from security import get_current_user, get_current_user_developer
from deps import get_session

router = APIRouter(tags=["News"])



@router.get("/news_status", response_model=List[NewsStatusResponse])
def get_all_news_status(session: Session = Depends(get_session)):
    news_status_list = session.query(NewsStatus).all()

    if not news_status_list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No news statuses found")

    return news_status_list  



@router.get("/log_news", response_model=List[LogNewsUpdateResponse])
def get_all_news_update(session: Session = Depends(get_session)):
    news_status_list = session.query(LogNewsUpdate).all()

    if not news_status_list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No news statuses found")

    return news_status_list  










@router.post("/news", response_model=NewsResponse)
def create_news(
    header: str = Form(...),
    detail: str = Form(...),
    image_news: Optional[UploadFile] = File(None),
    link: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    image_data = image_news.file.read() if image_news else None
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Create new News entry
    new_news = News(
        header=header,
        detail=detail,
        image_news=image_data,
        link=link,
        status_approve="request",
        request_By=user_profile.user_id
    )
    session.add(new_news)
    session.commit()
    session.refresh(new_news)


    log_news_status = NewsStatus(
        news_id=new_news.news_id,
        header=new_news.header,
        detail=new_news.detail,
        link=new_news.link,
        image_news=new_news.image_news,
        status_approve =new_news.status_approve,

        request_datetime = datetime.now().replace(microsecond=0),
        request_byid = user_profile.user_id,
        request_byname=f"{user_profile.first_name} {user_profile.last_name}",
        request_byrole = user_profile.role

    )
    session.add(log_news_status)
    session.commit()
    
    log_news = LogNewsUpdate(
        action_name="create",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=user_profile.user_id,
        role=user_profile.role, 
        news_id=new_news.news_id,
        header=new_news.header,
        detail=new_news.detail,
        link=new_news.link,
        image_news=new_news.image_news,
        to_image_news=new_news.image_news
    )
    session.add(log_news)
    session.commit()

    return new_news


@router.get("/news_image/{news_id}")
async def get_news_image_by_id(
    news_id: int, 
    session: Session = Depends(get_session), 
    
):
    news = session.query(News).filter(News.news_id == news_id).first()
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if news.image_news is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(news.image_news)
    return StreamingResponse(image_stream, media_type="image/jpeg")  # You can adjust the media type as needed


@router.get("/Log_tonews_image/{news_id}")
async def get_news_image_by_id(
    log_id: int, 
    session: Session = Depends(get_session)
):
    # Query for the news item with the specific news_id
    news = session.query(LogNewsUpdate).filter(
        LogNewsUpdate.id == log_id  # Use news_id here
    ).first()  # Ensure you fetch the first record

    # Check if the news item exists
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # Check if the image data is present
    if news.to_image_news is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(news.to_image_news)
    
    return StreamingResponse(image_stream, media_type="image/jpeg")


@router.get("/Log_news_image/{news_id}")
async def get_news_image_by_id(
    log_id: int, 
    session: Session = Depends(get_session)
):
    # Query for the news item with the specific news_id
    news = session.query(LogNewsUpdate).filter(
        LogNewsUpdate.id == log_id  # Use news_id here
    ).first()  # Ensure you fetch the first record

    # Check if the news item exists
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # Check if the image data is present
    if news.image_news is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(news.image_news)
    
    return StreamingResponse(image_stream, media_type="image/jpeg")



# GET: Fetch all News entries
@router.get("/news", response_model=List[NewsResponse])
def get_all_news(session: Session = Depends(get_session)):
    news_list = session.query(News).all()
    return news_list



@router.put("/news/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    header: Optional[str] = Form(None),
    image_news: Optional[UploadFile] = File(None),
    detail: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    image_data = image_news.file.read() if image_news else None
    # Fetch the news item by ID
    news = session.query(News).filter(News.news_id == news_id).first()
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    # Check if the news item exists
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Log the update action in LogNews
    log_news = LogNewsUpdate(
        action_name="update",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=user_profile.user_id,
        role=user_profile.role,
        news_id=news_id,
        image_news=news.image_news,
        to_image_news=image_data  if image_data  else news.image_news ,
        header=news.header,
        to_header=header if header else news.header,
        detail=news.detail,
        to_detail=detail if detail else news.detail,
        link=news.link,
        to_link=link if link else news.link,
    )
    session.add(log_news)

    # Update News entry
    news.image_news =image_data if image_data else news.image_news
    news.header = header if header else news.header
    news.detail = detail if detail else news.detail
    news.link = link if link else news.link
    # Note: For image_news, you'll need to handle the bytes data appropriately

    # Commit the changes to the database
    session.commit()

    return news

# DELETE: Delete News and log the deletion
@router.delete("/news/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(
    news_id: int,
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):

    news = session.query(News).filter(News.news_id == news_id).first()
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Log the deletion action in LogNews
    log_news = LogNewsUpdate(
        action_name="delete",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=user_profile.user_id,
        role=user_profile.role, 
        news_id=news_id,
        image_news=news.image_news,
        header=news.header,
        detail=news.detail,
        link=news.link,

    )
    session.add(log_news)

    # Delete News entry
    session.delete(news)
    session.commit()

    return None


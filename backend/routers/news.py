from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from models.user import UserProfile
from models.news import NewsResponse, NewsUpdate, News, LogNews
from security import get_current_user, get_current_user_developer
from deps import get_session

router = APIRouter(tags=["News"])

@router.post("/news", response_model=NewsResponse)
def create_news(
    header: str = Form(...),
    detail: str = Form(...),
    image_news: Optional[UploadFile] = File(None),
    link: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer), 
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
        link=link
    )
    session.add(new_news)
    session.commit()
    session.refresh(new_news)

    # Log the creation action in LogNews
    log_news = LogNews(
        action_name="create",
        action_datetime=datetime.now(),
        note_by=username,
        user_id=user_profile.user_id,
        role=role, 
        news_id=new_news.news_id,
        header=new_news.header,
        detail=new_news.detail,
        link=new_news.link,
        image_news=new_news.image_news
    )
    session.add(log_news)
    session.commit()

    return new_news


@router.get("/news/{news_id}/image", response_class=StreamingResponse)
def get_news_image(news_id: int, session: Session = Depends(get_session)):
    news = session.query(News).filter(News.news_id == news_id).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    if not news.image_news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(news.image_news)
    
    # Assuming the image is in JPEG format, you can change this based on the actual format (e.g., 'image/png' for PNG images)
    return StreamingResponse(image_stream, media_type="image/jpeg")

# GET: Fetch single News by ID
@router.get("/news/{news_id}", response_model=NewsResponse)
def get_news(news_id: int, session: Session = Depends(get_session)):
    news = session.query(News).filter(News.news_id == news_id).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    return news


# GET: Fetch all News entries
@router.get("/news", response_model=List[NewsResponse])
def get_all_news(session: Session = Depends(get_session)):
    news_list = session.query(News).all()
    return news_list


# PUT: Update News and log the update
@router.put("/news/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    news_data: NewsUpdate,
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer), 
    username: str = Depends(get_current_user)

):
   
    news = session.query(News).filter(News.news_id == news_id).first()
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Log the update action in LogNews
    log_news = LogNews(
        action_name="update",
        action_datetime=datetime.now(),
        note_by=username,
        user_id=user_profile.user_id,
        role=role, 
        news_id=news_id,
        header=news.header,
        to_header=news_data.header if news_data.header else news.header,
        detail=news.detail,
        to_detail=news_data.detail if news_data.detail else news.detail,
        link=news.link,
        to_link=news_data.link if news_data.link else news.link,
        image_news=news.image_news,
        to_image_news=news_data.image_news if news_data.image_news else news.image_news
    )
    session.add(log_news)

    # Update News entry
    news.header = news_data.header if news_data.header else news.header
    news.detail = news_data.detail if news_data.detail else news.detail
    news.link = news_data.link if news_data.link else news.link
    news.image_news = news_data.image_news if news_data.image_news else news.image_news
    session.commit()

    return news

# DELETE: Delete News and log the deletion
@router.delete("/news/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(
    news_id: int,
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer), 
    username: str = Depends(get_current_user)
):

    news = session.query(News).filter(News.news_id == news_id).first()
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Log the deletion action in LogNews
    log_news = LogNews(
        action_name="delete",
        action_datetime=datetime.now(),
        note_by=username,
        user_id=user_profile.user_id,
        role=role, 
        news_id=news_id,
        header=news.header,
        detail=news.detail,
        link=news.link,
        image_news=news.image_news
    )
    session.add(log_news)

    # Delete News entry
    session.delete(news)
    session.commit()

    return None

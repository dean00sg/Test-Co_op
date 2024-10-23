
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from deps import Base
from typing import List, Optional

class News(Base):
    __tablename__ = 'News'

    news_id = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    image_news = Column(LargeBinary, nullable=True)
    header = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    link = Column(String, nullable=True)
  
    


class LogNews(Base):
    __tablename__ = 'log_News'

    id = Column(Integer, primary_key=True, index=True)
    action_name = Column(String, nullable=False)
    action_datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    note_by = Column(String, nullable=False)
    user_id = Column(Integer, nullable=False)
    role = Column(String, nullable=False)
    
    news_id = Column(Integer, nullable=True)
    image_news = Column(LargeBinary, nullable=True)
    to_image_news = Column(LargeBinary, nullable=True)
    header = Column(String, nullable=True)
    to_header = Column(String, nullable=True)
    detail = Column(String, nullable=True)
    to_detail = Column(String, nullable=True)
    link = Column(String, nullable=True)
    to_link = Column(String, nullable=True)





class NewsCreate(BaseModel):
    header: str
    image_news: bytes
    detail: str
    link: Optional[str] = None


class NewsUpdate(BaseModel):
    header: Optional[str] = None
    image_news: Optional[bytes] = None
    detail:Optional[str] = None
    link: Optional[str] = None

class NewsResponse(BaseModel):
    news_id: int
    datetime: datetime
    header: str
    detail: str
    link: Optional[str] = None

    class Config:
        orm_mode = True
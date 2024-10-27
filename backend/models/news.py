
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
    status_approve = Column(String,nullable=True )
    request_By=Column(Integer,nullable=True )
  
    


class LogNewsUpdate(Base):
    __tablename__ = 'log_NewsUpadate'

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

    

class NewsStatus(Base):
    __tablename__ = 'log_NewsStatus'

    status_id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, nullable=True)
    image_news = Column(LargeBinary, nullable=True)
    header = Column(String, nullable=True)
    detail = Column(String, nullable=True)
    link = Column(String, nullable=True)
    status_approve = Column(String, nullable=True)
    request_datetime = Column(DateTime,nullable=True ) 
    request_byid = Column(String, nullable=True)
    request_byname = Column(String, nullable=True)
    request_byrole = Column(String, nullable=True)
    
    to_status_approve = Column(String, nullable=True)
    approve_datetime = Column(DateTime,nullable=True ) 
    approve_byid = Column(String, nullable=True)
    approve_byname = Column(String, nullable=True)
    approve_byrole = Column(String, nullable=True)

class LogNewsUpdateResponse(BaseModel):

    id : int
    action_name : str
    action_datetime :datetime
    note_by: str
    user_id : int
    role: str
    news_id : int
    header: str
    to_header : Optional[str] = None 
    detail : str
    to_detail:Optional[str] = None 
    link: str
    to_link : Optional[str] = None 

class NewsStatusResponse(BaseModel):
    status_id: int
    news_id: int
    header: str
    detail: str
    link: str
    status_approve: str

    request_datetime: datetime
    request_byid: Optional[str] = None  # Optional field
    request_byname: Optional[str] = None  # Optional field
    request_byrole: Optional[str] = None  # Optional field
    
    to_status_approve: Optional[str] = None  # Optional field
    approve_datetime: Optional[datetime] = None  # Optional field
    approve_byid: Optional[str] = None  # Optional field
    approve_byname: Optional[str] = None  # Optional field
    approve_byrole: Optional[str] = None  # Optional field



class NewsStatusUpdate(BaseModel):

    status_approve : Optional[str] = None




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
    status_approve:str
    request_By:int

    class Config:
        orm_mode = True
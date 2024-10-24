
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from deps import Base
from typing import List, Optional

class SlideText(Base):
    __tablename__ = 'SlideText'

    slitetext_id = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    header = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    remark = Column(String, nullable=False)
    status_show = Column(String, default="show")
    
class LogSlideText(Base):
    __tablename__ = 'log_SlideText'

    id = Column(Integer, primary_key=True, index=True)
    action_name = Column(String, nullable=False)
    action_datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    note_by = Column(String, nullable=False)
    user_id = Column(Integer, nullable=False)
    role = Column(String, nullable=False)

    slitetext_id = Column(Integer, nullable=False)
    header = Column(String, nullable=False)
    to_header = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    to_detail = Column(String, nullable=False)
    remark = Column(String, nullable=False)
    to_remark = Column(String, nullable=False)


class SlideTextCreate(BaseModel):
    header: str
    detail: str
    remark: str


class SlideTextUpdate(BaseModel):
    header: Optional[str] = None
    detail:Optional[str] = None
    remark: Optional[str] = None

class SlideTextResponse(BaseModel):
    slitetext_id: int
    datetime: datetime
    header: str
    detail: str
    remark: str
    status_show:str

    class Config:
        orm_mode = True
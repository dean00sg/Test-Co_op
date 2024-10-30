
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from deps import Base
from typing import List, Optional

class Meeting(Base):
    __tablename__ = 'Meeting'

    meet_id = Column(Integer, primary_key=True, index=True)
    datetime_create = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    create_byid = Column(Integer, nullable=False)
    header =  Column(String, nullable=False)
    description = Column(String, nullable=False)
    file = Column(LargeBinary, nullable=True)
    room = Column(String, nullable=False)
    start_datetime_meet =Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    end_datetime_meet = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    to_user_id = Column(String, nullable=True)
    remark = Column(String, nullable=True)


class UserCalendar(Base):
    __tablename__ = 'UserCalendar'

    celendar_id = Column(Integer, primary_key=True, index=True)
    datetime_create = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    create_byid = Column(Integer, nullable=False)
    header =  Column(String, nullable=False)
    description = Column(String, nullable=False)
    color=Column(String, nullable=False)
    start_datetime_meet =Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    end_datetime_meet = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 



class MeetingCreate(BaseModel):
    header: str
    description: str
    room: str
    start_datetime_meet: datetime
    end_datetime_meet: datetime
    to_user_id: List[int]
    remark: str


class MeetingResponse(BaseModel):
    meet_id: int
    datetime_create: datetime
    create_byid: int
    header: str
    description: str
    to_user_id: str
    room: str
    start_datetime_meet: datetime
    end_datetime_meet: datetime
    remark: str

    class Config:
        orm_mode = True


class UserCalendarResponse(BaseModel):

    celendar_id :int
    datetime_create :datetime
    create_byid :int
    header :str
    description :str
    color:str
    start_datetime_meet :datetime
    end_datetime_meet :datetime

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from deps import Base
from typing import List, Optional


class RoomMeeting(Base):
    __tablename__ = 'RoomMeeting'

    room_id = Column(Integer, primary_key=True, index=True)
    record_datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    name_room = Column(String, nullable=True)
    image_room  = Column(LargeBinary, nullable=True)
    seats_total = Column(Integer,nullable=True )
    room_detail = Column(String, nullable=True)
    caretaker_id = Column(Integer,nullable=True )


class BookingRoomMeeting(Base):
    __tablename__ = 'BookingRoomMeeting'

    BRM_id =  Column(Integer, primary_key=True, index=True)
    record_datetime = Column(DateTime, default=lambda: datetime.now().replace(microsecond=0)) 
    room_id  = Column(Integer,nullable=True )
    title_meeting = Column(String, nullable=True)
    start_datetime = Column(DateTime,nullable=True) 
    end_datetime = Column(DateTime,nullable=True) 
    booker_id = Column(Integer,nullable=True )
    members = Column(String, nullable=True)
    remark  = Column(String, nullable=True)
    members_first_confirm  = Column(Integer,nullable=True )
    status_first_confirm = Column(String, nullable=True)
    datetime_first_confirm = Column(String, nullable=True)

    members_second_confirm = Column(Integer,nullable=True )
    status_second_confirm = Column(String, nullable=True)
    datetime_second_confirm = Column(String, nullable=True)
    status_booking  = Column(String, nullable=True)






class MemberConfirm(BaseModel):

    member_confirm : Optional[str] = None


class BookingMeetingResponse(BaseModel):
    BRM_id :  int
    record_datetime :datetime
    room_id  :int
    title_meeting :str
    start_datetime :datetime
    end_datetime :datetime
    booker_id :int
    members :str
    remark  :str
    members_first_confirm  :int
    status_first_confirm :str
    datetime_first_confirm :Optional[datetime] = None

    members_second_confirm :int
    status_second_confirm :str
    datetime_second_confirm :Optional[datetime] = None
    status_booking  :str
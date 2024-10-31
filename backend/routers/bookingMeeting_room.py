from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from models.bookingMeeting_room import BookingMeetingResponse, BookingRoomMeeting
from models.user import LogUserProfile, UserProfile

from security import get_current_user, get_current_user_developer
from deps import get_session

router = APIRouter(tags=["BookingRoom"])


@router.post("/booking/", response_model=BookingMeetingResponse)
async def create_bookingroom(
    room_id: int = Form(...),
    title_meeting: str = Form(...),
    start_datetime: datetime = Form(...),
    end_datetime: datetime = Form(...),
    members: str = Form(...),
    remark: str = Form(...),
    member_confirm: str = Form(...),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # แยกและตรวจสอบจำนวนสมาชิกที่ยืนยัน
    members_list = list(map(int, member_confirm.split(",")))
    if len(members_list) != 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Members count must be exactly 2")

    user_first_confirm = members_list[0]
    user_second_confirm = members_list[1]


    db_booking = BookingRoomMeeting(
        room_id=room_id,
        title_meeting=title_meeting,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        booker_id=user_profile.user_id,
        members=members,
        remark=remark,
        members_first_confirm=user_first_confirm,
        status_first_confirm="request",
        datetime_first_confirm=None,
        members_second_confirm=user_second_confirm,
        status_second_confirm="request",
        datetime_second_confirm=None,
        status_booking="waiting"
    )

    session.add(db_booking)

    
    session.commit()
    session.refresh(db_booking)

    # Response
    response = BookingMeetingResponse(
        BRM_id=db_booking.BRM_id,
        record_datetime=db_booking.record_datetime,
        room_id=db_booking.room_id,
        title_meeting=db_booking.title_meeting,
        start_datetime=db_booking.start_datetime,
        end_datetime=db_booking.end_datetime,
        booker_id=user_profile.user_id,
        members=db_booking.members,
        remark=db_booking.remark,
        members_first_confirm=db_booking.members_first_confirm,
        status_first_confirm=db_booking.status_first_confirm,
        datetime_first_confirm=db_booking.datetime_first_confirm,
        members_second_confirm=db_booking.members_second_confirm,
        status_second_confirm=db_booking.status_second_confirm,
        datetime_second_confirm=db_booking.datetime_second_confirm,
        status_booking=db_booking.status_booking
    )
    
    return response





@router.put("/member_confirm", response_model=BookingMeetingResponse)
async def member_confirm_room(
    booking_id: int = Form(...),
    user_confirm: str = Form("confirm"),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()
    
    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    booking_room = session.query(BookingRoomMeeting).filter(BookingRoomMeeting.BRM_id == booking_id).first()
    
    if not booking_room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # อัปเดตสถานะการยืนยันสมาชิก
    if booking_room.members_first_confirm == user_profile.user_id:
        booking_room.status_first_confirm = user_confirm 
        booking_room.datetime_first_confirm = datetime.now().replace(microsecond=0)  

    elif booking_room.members_second_confirm == user_profile.user_id:
        booking_room.status_second_confirm = user_confirm 
        booking_room.datetime_second_confirm = datetime.now().replace(microsecond=0) 


    if (booking_room.status_first_confirm == "confirm" and 
        booking_room.status_second_confirm == "confirm"):
        booking_room.status_booking = "Pass"
    else:
        booking_room.status_booking = booking_room.status_booking  

    session.commit()
    session.refresh(booking_room)

    # Response
    response = BookingMeetingResponse(
        BRM_id=booking_room.BRM_id,
        record_datetime=booking_room.record_datetime,
        room_id=booking_room.room_id,
        title_meeting=booking_room.title_meeting,
        start_datetime=booking_room.start_datetime,
        end_datetime=booking_room.end_datetime,
        booker_id=booking_room.booker_id,
        members=booking_room.members,
        remark=booking_room.remark,
        members_first_confirm=booking_room.members_first_confirm,
        status_first_confirm=booking_room.status_first_confirm,
        datetime_first_confirm=booking_room.datetime_first_confirm,
        members_second_confirm=booking_room.members_second_confirm,
        status_second_confirm=booking_room.status_second_confirm,
        datetime_second_confirm=booking_room.datetime_second_confirm,
        status_booking=booking_room.status_booking
    )
    
    return response

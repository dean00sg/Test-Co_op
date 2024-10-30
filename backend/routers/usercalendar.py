from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from models.notification import UserCalendarResponse,UserCalendar
from models.user import LogUserProfile, UserProfile

from security import get_current_user, get_current_user_developer
from deps import get_session

router = APIRouter(tags=["UserCalendar"])


from fastapi import Form

@router.post("/meetings/", response_model=UserCalendarResponse)
async def create_meeting(
    header: str = Form(...),
    description: str = Form(...),
    color : str = Form(...),
    start_datetime_meet: datetime = Form(...),
    end_datetime_meet: datetime = Form(...),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
  
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # สร้าง instance ของ Meeting สำหรับบันทึกในฐานข้อมูล
    new_UserCalendar = UserCalendar(
        datetime_create=datetime.now().replace(microsecond=0),
        header=header,
        description=description,
        color=color,
        start_datetime_meet=start_datetime_meet,
        end_datetime_meet=end_datetime_meet,
        create_byid=user_profile.user_id
    )

    session.add( new_UserCalendar)
    session.commit()
    session.refresh( new_UserCalendar)
    
    return  new_UserCalendar




@router.get("/user_all", response_model=List[UserCalendarResponse])
def get_meetings_by_user_id( db: Session = Depends(get_session)):
    meetings = db.query(UserCalendar).all()
    if not meetings:
        raise HTTPException(status_code=404, detail="No meetings found for the given user_id")
    return meetings


@router.get("/user/{user_id}", response_model=List[UserCalendarResponse])
def get_meetings_by_user_id(user_id: int, db: Session = Depends(get_session)):
    usercalendar = db.query(UserCalendar).filter(UserCalendar.create_byid==user_id).all()
    if not usercalendar:
        raise HTTPException(status_code=404, detail="No meetings found for the given user_id")
    return usercalendar



@router.delete("/meetings/{celendar_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(celendar_id: int, session: Session = Depends(get_session), username: str = Depends(get_current_user)):
    # Fetch the meeting by meet_id
    usercalendar = session.query(UserCalendar).filter(UserCalendar.celendar_id == celendar_id).first()

    if not usercalendar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=" not found")
    
    # Check if the user is allowed to delete this meeting (optional)
    # user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()
    # if usercalendar.create_byid != user_profile.user_id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this meeting")
    
    # Delete the meeting
    session.delete(usercalendar)
    session.commit()



@router.put("/meetings/{celendar_id}", response_model=UserCalendarResponse)
async def update_meeting(
    celendar_id: int,
    header: str = Form(...),
    description: str = Form(...),
    color: str = Form(...),
    start_datetime_meet: datetime = Form(...),
    end_datetime_meet: datetime = Form(...),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    usercalendar = session.query(UserCalendar).filter(UserCalendar.celendar_id == celendar_id).first()

    if not usercalendar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    # Update meeting details
    usercalendar.header = header
    usercalendar.description = description
    usercalendar.color = color
    usercalendar.start_datetime_meet = start_datetime_meet
    usercalendar.end_datetime_meet = end_datetime_meet
    usercalendar.datetime_update = datetime.now().replace(microsecond=0)  # Assuming you want to track when the meeting was updated

    session.commit()
    session.refresh(usercalendar)

    return usercalendar
from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from models.notification import Meeting, MeetingCreate, MeetingResponse
from models.user import LogUserProfile, UserProfile

from security import get_current_user, get_current_user_developer
from deps import get_session

router = APIRouter(tags=["Meeting"])


from fastapi import Form

@router.post("/meetings/", response_model=MeetingResponse)
async def create_meeting(
    header: str = Form(...),
    description: str = Form(...),
    room: str = Form(...),
    start_datetime_meet: datetime = Form(...),
    end_datetime_meet: datetime = Form(...),
    to_user_id: str= Form(...),
    remark: str = Form(...),
    file_insert: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    username: str = Depends(get_current_user)
):
    # อ่านข้อมูลจากไฟล์
    file_data = await file_insert.read() if file_insert else None
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # สร้าง instance ของ Meeting สำหรับบันทึกในฐานข้อมูล
    db_meeting = Meeting(
        datetime_create=datetime.now().replace(microsecond=0),
        header=header,
        description=description,
        room=room,
        file=file_data,
        start_datetime_meet=start_datetime_meet,
        end_datetime_meet=end_datetime_meet,
        to_user_id=to_user_id,
        remark=remark,
        create_byid=user_profile.user_id
    )

    session.add(db_meeting)
    session.commit()
    session.refresh(db_meeting)

    # Response
    response = MeetingResponse(
        meet_id=db_meeting.meet_id,
        datetime_create=db_meeting.datetime_create,
        create_byid=db_meeting.create_byid,
        header=db_meeting.header,
        description=db_meeting.description,
        room=db_meeting.room,
        # file=db_meeting.file,
        start_datetime_meet=db_meeting.start_datetime_meet,
        end_datetime_meet=db_meeting.end_datetime_meet,
        remark=db_meeting.remark
    )
    
    return response


# GET endpoint to retrieve meetings by a user_id in to_user_id list
@router.get("/meetings/user/{user_id}", response_model=List[MeetingResponse])
def get_meetings_by_user_id(user_id: int, db: Session = Depends(get_session)):
    meetings = db.query(Meeting).filter(Meeting.to_user_id.like(f"%{user_id}%")).all()
    if not meetings:
        raise HTTPException(status_code=404, detail="No meetings found for the given user_id")
    return meetings


@router.get("/meetings/file/{meet_id}")
async def get_meeting_file(meet_id: int, session: Session = Depends(get_session)):
    # Query the meeting by meet_id
    meeting = session.query(Meeting).filter(Meeting.meet_id == meet_id).first()
    
    if not meeting or not meeting.file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting or file not found")
    
    # Create a BytesIO stream from the file data
    file_stream = BytesIO(meeting.file)
    
    # Set the appropriate content type (e.g., application/octet-stream for generic binary files)
    return StreamingResponse(file_stream, media_type='application/octet-stream', headers={"Content-Disposition": f"attachment; filename={meeting.header}.file"})
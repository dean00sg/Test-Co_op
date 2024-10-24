from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from models.slidetext_show import SlideText, LogSlideText, SlideTextCreate, SlideTextUpdate, SlideTextResponse
from security import get_current_user, get_current_user_developer
from deps import get_session
from models.user import UserProfile

router = APIRouter(tags=["SlideText"])

# POST: Create a new SlideText entry
@router.post("/create", response_model=SlideTextResponse)
def create_slide_text(
    header: str = Form(...),
    detail: str = Form(...),
    remark: str = Form(...),
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer), 
    username: str = Depends(get_current_user)
):
    user_profile = session.query(UserProfile).filter(UserProfile.email == username).first()

    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Create new SlideText entry
    new_slide_text = SlideText(
        header=header,
        detail=detail,
        remark=remark
    )
    session.add(new_slide_text)
    session.commit()
    session.refresh(new_slide_text)

    # Log the creation action in LogSlideText
    log = LogSlideText(
        action_name="create",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=user_profile.user_id,
        role=role,  # Assuming role is a tuple, use the first element
        slitetext_id=new_slide_text.slitetext_id,
        header=new_slide_text.header,
        to_header=new_slide_text.header,
        detail=new_slide_text.detail,
        to_detail=new_slide_text.detail,
        remark=new_slide_text.remark,
        to_remark=new_slide_text.remark
    )
    session.add(log)
    session.commit()

    return new_slide_text


# GET: Retrieve all SlideText entries
@router.get("/get all", response_model=List[SlideTextResponse])
def get_slide_texts(session: Session = Depends(get_session)):
    return session.query(SlideText).all()

@router.get("/slideText/status_show", response_model=List[SlideTextResponse])
def get_slide_texts(
    status_show: Optional[str] = Query("show"),  # Default to 'show'
    session: Session = Depends(get_session)
):
    query = session.query(SlideText)
    
    if status_show:
        query = query.filter(SlideText.status_show == status_show)

    return query.all()

# PUT: Update an existing SlideText entry
@router.put("/{slide_text_id}", response_model=SlideTextResponse)
def update_slide_text(
    slide_text_id: int,
    header: Optional[str] = Form(None),
    detail: Optional[str] = Form(None),
    remark: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer),
    username: str = Depends(get_current_user)
):
    slide_text = session.query(SlideText).filter(SlideText.slitetext_id == slide_text_id).first()

    if not slide_text:
        raise HTTPException(status_code=404, detail="SlideText not found")

    # Log the update action
    log = LogSlideText(
        action_name="update",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=slide_text.user_id,  # Fetch user_id from the slide_text
        role=role,
        slitetext_id=slide_text.slitetext_id,
        header=slide_text.header,
        to_header=header or slide_text.header,
        detail=slide_text.detail,
        to_detail=detail or slide_text.detail,
        remark=slide_text.remark,
        to_remark=remark or slide_text.remark
    )
    session.add(log)

    # Update the SlideText
    if header is not None:
        slide_text.header = header
    if detail is not None:
        slide_text.detail = detail
    if remark is not None:
        slide_text.remark = remark

    session.commit()
    session.refresh(slide_text)

    return slide_text


# DELETE: Delete a SlideText entry
@router.delete("/{slide_text_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slide_text(
    slide_text_id: int,
    session: Session = Depends(get_session),
    role: tuple = Depends(get_current_user_developer),
    username: str = Depends(get_current_user)
):
    slide_text = session.query(SlideText).filter(SlideText.slitetext_id == slide_text_id).first()

    if not slide_text:
        raise HTTPException(status_code=404, detail="SlideText not found")

    # Log the deletion action
    log = LogSlideText(
        action_name="delete",
        action_datetime=datetime.now().replace(microsecond=0),
        note_by=username,
        user_id=slide_text.user_id,  # Fetch user_id from the slide_text
        role=role,
        slitetext_id=slide_text.slitetext_id,
        header=slide_text.header,
        to_header=slide_text.header,
        detail=slide_text.detail,
        to_detail=slide_text.detail,
        remark=slide_text.remark,
        to_remark=slide_text.remark
    )
    session.add(log)

    # Delete the SlideText
    session.delete(slide_text)
    session.commit()

    return None

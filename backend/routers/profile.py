from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from deps import get_session
from security import AuthHandler, get_current_user, get_current_user_developer
from models.user import LogCheckUserProfile,  LogUserProfile, UserResponse, UserProfile

router = APIRouter(tags=["Profile"])
auth_handler = AuthHandler()






@router.get("/logs", response_model=list[LogCheckUserProfile])
async def get_user_logs(
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user_developer)
):
    # Retrieve all logs from the database
    logs = session.query(LogUserProfile).all()

    if not logs:
        raise HTTPException(status_code=404, detail="No logs found")

    # Transform the logs into LogCheckUserProfile instances
    log_check_user_profiles = [
        LogCheckUserProfile(
            id=log.id,
            action_name=log.action_name,
            action_datetime=log.action_datetime,  # Use action_datetime from LogUserProfile
            user_id=log.user_id,
            first_name=log.first_name or "",  # Provide default if None
            to_first_name=log.to_first_name or "",  # Provide default if None
            last_name=log.last_name or "",  # Provide default if None
            to_last_name=log.to_last_name or "",  # Provide default if None
            email=log.email or "",  # Provide default if None
            contact_number=log.contact_number or "",  # Provide default if None
            to_contact_number=log.to_contact_number or "",  # Provide default if None
            role=log.role or "user"  # Provide default if None
        )
        for log in logs
    ]

    return log_check_user_profiles




@router.get("/image/{user_id}")
async def get_user_imagebyid(user_id: int, session: Session = Depends(get_session)):
    user = session.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.image_profile is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(user.image_profile)
    return StreamingResponse(image_stream, media_type="image/jpeg") 




@router.get("/image")
async def get_user_image(current_user_email: str = Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.image_profile is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Create a BytesIO stream to send the image data
    image_stream = BytesIO(user.image_profile)
    return StreamingResponse(image_stream, media_type="image/jpeg")  # Change media_type as needed


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    # Fetch the user profile from the database
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user profile details
    return UserResponse(
        status="User profile retrieved successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )


@router.get("/profile all", response_model=list[UserResponse])
async def get_all_user_profiles(
    current_user_email: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if the current user has the developer role
    current_user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    
    if not current_user or current_user.role != "developer":
        raise HTTPException(status_code=403, detail="Access denied. Only developers can view all user profiles.")

    # Fetch all user profiles from the database
    users = session.query(UserProfile).all()

    if not users:
        raise HTTPException(status_code=404, detail="No users found")

    # Prepare the response
    user_responses = [
        UserResponse(
            status="User profile retrieved successfully",
            user_id=user.user_id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            contact_number=user.contact_number,
            role=user.role
        )
        for user in users
    ]

    return user_responses


@router.put("/update_image", response_model=UserResponse)
async def update_user_image(
    image: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Read the image file
    image_data = await image.read()

    # Create a log entry for tracking the image update
    log_entry = LogUserProfile(
        action_name="update_image",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role,
        image_profile=user.image_profile  # Log the current image
    )

    # Update the user's image profile
    user.image_profile = image_data
    log_entry.to_image_profile = user.image_profile  # Log the new image

    session.add(log_entry)
    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse(
        status="Profile image updated successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )

@router.put("/update", response_model=UserResponse)
async def update_user_profile(
    first_name: str = Form(None),
    last_name: str = Form(None),
    contact_number: str = Form(None),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    # Fetch the user profile from the database
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create a log entry for tracking changes
    log_entry = LogUserProfile(
        action_name="update",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role,
        image_profile=user.image_profile  # Log the current image
    )

    # Update fields as needed
    if first_name:
        log_entry.to_first_name = first_name
        user.first_name = first_name
    if last_name:
        log_entry.to_last_name = last_name
        user.last_name = last_name
    if contact_number:
        log_entry.to_contact_number = contact_number
        user.contact_number = contact_number

    # Save the updated data
    session.add(log_entry)
    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse(
        status="User updated successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )


@router.put("/password", response_model=UserResponse)
async def update_user_password(
    password: str = Form(...),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
   
        user.image_profile = image_data

    # Create a log entry for tracking the password update
    log_entry = LogUserProfile(
        action_name="update_password",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,  # Log current hashed password
        role=user.role,
        image_profile=user.image_profile
    )

    # Hash the new password using the AuthHandler
    new_hashed_password = auth_handler.get_password_hash(password)
    log_entry.to_password = new_hashed_password  # Log the new hashed password
    user.password = new_hashed_password  # Update the user profile with the new hashed password

    session.add(log_entry)
    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse(
        status="Password updated successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )


@router.delete("/delete", response_model=UserResponse)
async def delete_user(
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user)
):
    user = session.query(UserProfile).filter(UserProfile.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_entry = LogUserProfile(
        action_name="delete",
        action_datetime=datetime.now().replace(microsecond=0),
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        password=user.password,
        role=user.role,
        image_profile=user.image_profile
    )

    delete_response = UserResponse(
        status="User deleted successfully",
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        contact_number=user.contact_number,
        role=user.role
    )

    session.add(log_entry)
    session.delete(user)
    session.commit()
    
    return delete_response

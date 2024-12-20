from fastapi import FastAPI
from .user import router as auth_router
from .profile import router as profile_router
from .developer import router as developer_router
from .news import router as news_router
from .slidetext_show import router as slidetext_router
from .notifacation import router as meet_router
from .usercalendar import router as usercalendar_router
from .bookingMeeting_room import router as bookingroom_router


def init_router(app: FastAPI):
    app.include_router(auth_router, prefix="/authentication")
    app.include_router(profile_router, prefix="/profile")
    app.include_router(developer_router)
    app.include_router(news_router, prefix="/news")
    app.include_router(slidetext_router, prefix="/slideText")
    app.include_router(meet_router, prefix="/Meeting")
    app.include_router(usercalendar_router, prefix="/UserCalendar")
    app.include_router(bookingroom_router)



  
from fastapi import FastAPI
from .user import router as auth_router
from .profile import router as profile_router
from .developer import router as developer_router
from .news import router as news_router


def init_router(app: FastAPI):
    app.include_router(auth_router, prefix="/authentication")
    app.include_router(profile_router, prefix="/profile")
    app.include_router(developer_router)
    app.include_router(news_router, prefix="/news")



  
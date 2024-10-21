from fastapi import FastAPI
from .user import router as auth_router
# from .feedpost import router as feedpost_router
# from .category import router as category_router
# from .option import router as option_router
# from .menu_create import router as menu_router
# from .promotion import router as promotion_router
# from .orders import router as order_router
# from .payment import router as payment_router

def init_router(app: FastAPI):
    app.include_router(auth_router, prefix="/authentication")
    # app.include_router(feedpost_router, prefix="/feedpost")
    # app.include_router(category_router, prefix="/category")
    # app.include_router(option_router, prefix="/option")
    # app.include_router(menu_router, prefix="/menu")
    # app.include_router(promotion_router, prefix="/promotion")
    # app.include_router(order_router, prefix="/Orders")
    # app.include_router(payment_router, prefix="/Payment")
  
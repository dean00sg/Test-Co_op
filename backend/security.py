from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import Depends, HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1000

class Token(BaseModel):
    access_token: str
    token_type: str


class AuthHandler:
    def __init__(self):
        self.secret = SECRET_KEY
        self.algorithm = ALGORITHM
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret, algorithm=self.algorithm)
        return encoded_jwt

    def decode_access_token(self, token: str) -> Dict[str, str]:
        try:
            payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
            return payload
        except JWTError:
            raise Exception("Invalid token")



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="authentication/login")
auth_handler = AuthHandler()


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_handler.decode_access_token(token)
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return username

async def get_current_user_role(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_handler.decode_access_token(token)
        role: str = payload.get("role")
        if role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if role != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return role
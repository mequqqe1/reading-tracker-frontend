from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, auth, schemas
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from pydantic import BaseModel
from app.database import get_db


router = APIRouter(prefix="/auth", tags=["Auth"])
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate,db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed = auth.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

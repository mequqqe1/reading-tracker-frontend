from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth
from typing import List
from datetime import datetime

router = APIRouter(prefix="/progress", tags=["Reading Progress"])

@router.post("/", response_model=schemas.ProgressOut)
def update_progress(progress: schemas.ProgressCreate,db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    db_progress = (
        db.query(models.ReadingProgress)
        .filter(models.ReadingProgress.user_id == user.id, models.ReadingProgress.book_id == progress.book_id)
        .first()
    )
    if db_progress:
        db_progress.current_page = progress.current_page
        db_progress.updated_at = datetime.utcnow()
    else:
        db_progress = models.ReadingProgress(
            user_id=user.id,
            book_id=progress.book_id,
            current_page=progress.current_page,
        )
        db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.get("/", response_model=List[schemas.ProgressOut])
def get_user_progress(db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    return db.query(models.ReadingProgress).filter(models.ReadingProgress.user_id == user.id).all()

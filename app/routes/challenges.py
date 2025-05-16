from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth
from typing import List

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("/", response_model=schemas.ChallengeOut)
def create_challenge(challenge: schemas.ChallengeCreate, db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    db_challenge = models.Challenge(**challenge.dict())
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

@router.get("/", response_model=List[schemas.ChallengeOut])
def get_challenges(db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    return db.query(models.Challenge).all()

@router.post("/join", response_model=schemas.ChallengeEntryOut)
def join_challenge(join: schemas.ChallengeJoin, db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    # Проверим, не присоединился ли уже
    existing = db.query(models.ChallengeEntry).filter_by(user_id=user.id, challenge_id=join.challenge_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined")
    
    entry = models.ChallengeEntry(user_id=user.id, challenge_id=join.challenge_id, status="in_progress")
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/my", response_model=List[schemas.ChallengeEntryOut])
def my_challenges(db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    return (
        db.query(models.ChallengeEntry)
        .filter(models.ChallengeEntry.user_id == user.id)
        .all()
    )

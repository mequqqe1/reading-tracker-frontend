from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/books", tags=["Books"])


@router.post("/", response_model=schemas.BookOut)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user),
):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/", response_model=List[schemas.BookOut])
def get_books(
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user),
):
    return db.query(models.Book).all()


@router.get("/{book_id}", response_model=schemas.BookOut)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user),
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user),
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"detail": "Book deleted"}

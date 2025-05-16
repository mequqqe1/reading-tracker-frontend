from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str


class BookCreate(BaseModel):
    title: str
    author: str
    total_pages: int
    cover_url: str

class BookOut(BookCreate):
    id: int

    class Config:
        orm_mode = True


class ProgressCreate(BaseModel):
    book_id: int
    current_page: int

class ProgressOut(BaseModel):
    id: int
    book_id: int
    current_page: int
    updated_at: datetime
    book: BookOut

    class Config:
        orm_mode = True


class ChallengeCreate(BaseModel):
    title: str
    goal_books: int
    start_date: datetime
    end_date: datetime

class ChallengeOut(ChallengeCreate):
    id: int

    class Config:
        orm_mode = True

class ChallengeJoin(BaseModel):
    challenge_id: int

class ChallengeEntryOut(BaseModel):
    id: int
    status: str
    challenge: ChallengeOut

    class Config:
        orm_mode = True

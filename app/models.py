from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True)

    progress = relationship("ReadingProgress", back_populates="user")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    total_pages = Column(Integer)
    cover_url = Column(String)

    progress = relationship("ReadingProgress", back_populates="book")

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    goal_books = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    entries = relationship("ChallengeEntry", back_populates="challenge")

class ChallengeEntry(Base):
    __tablename__ = "challenge_entries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    status = Column(String, default="in_progress")

    challenge = relationship("Challenge", back_populates="entries")

class ReadingProgress(Base):
    __tablename__ = "reading_progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    current_page = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    book = relationship("Book", back_populates="progress")

# app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.db.base import Base

class User(Base):
    __tablename__ = "user"

    id = Column(String, primary_key=True, index=True)  # Changed to String for UUID
    name = Column(String, nullable=True)  # User's chosen display name
    email = Column(String, unique=True, index=True, nullable=False)
    emailVerified = Column(Boolean, default=False)  # Whether the user's email is verified
    image = Column(String, nullable=True)  # User's image url
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # Account creation timestamp (timezone-aware)
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # Last update timestamp (timezone-aware)
    hashed_password = Column(String, nullable=True)
    user_type = Column(String, nullable=True)  # 'business', 'society', or 'admin' //TODO: add support for user type
    is_active = Column(Integer, default=1)

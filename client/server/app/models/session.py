from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.db.base import Base

class Session(Base):
    __tablename__ = "session"

    id = Column(String, primary_key=True, index=True)  # Unique identifier for each session
    userId = Column(String, ForeignKey("user.id"), nullable=False)  # The ID of the user (FK)
    token = Column(String, unique=True, nullable=False)  # The unique session token
    expiresAt = Column(DateTime, nullable=False)  # The time when the session expires
    ipAddress = Column(String, nullable=True)  # The IP address of the device
    userAgent = Column(String, nullable=True)  # The user agent information of the device
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # Session creation timestamp
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # Last update timestamp

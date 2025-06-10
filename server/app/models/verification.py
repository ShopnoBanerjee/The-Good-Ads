from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from app.db.base_class import Base

class Verification(Base):
    __tablename__ = "verification"

    id = Column(String, primary_key=True, index=True)  # Unique identifier for each verification
    identifier = Column(String, nullable=False)  # The identifier for the verification request
    value = Column(String, nullable=False)  # The value to be verified
    expiresAt = Column(DateTime, nullable=False)  # The time when the verification request expires
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)  # Timestamp of when the verification request was created
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)  # Timestamp of when the verification request was updated
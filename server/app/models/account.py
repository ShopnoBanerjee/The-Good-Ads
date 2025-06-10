
from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.db.base_class import Base

class Account(Base):
    __tablename__ = "account"

    id = Column(String, primary_key=True, index=True)  # Unique identifier for each account
    userId = Column(String, ForeignKey("user.id"), nullable=False, index=True)  # The ID of the user
    accountId = Column(String, nullable=False)  # The ID of the account as provided by the SSO or equal to userId for credential accounts
    providerId = Column(String, nullable=False)  # The ID of the provider
    accessToken = Column(String, nullable=True)  # The access token of the account. Returned by the provider
    refreshToken = Column(String, nullable=True)  # The refresh token of the account. Returned by the provider
    accessTokenExpiresAt = Column(DateTime, nullable=True)  # The time when the access token expires
    refreshTokenExpiresAt = Column(DateTime, nullable=True)  # The time when the refresh token expires
    scope = Column(String, nullable=True)  # The scope of the account. Returned by the provider
    idToken = Column(String, nullable=True)  # The ID token returned from the provider
    password = Column(String, nullable=True)  # The password of the account. Mainly used for email and password authentication
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)  # Timestamp of when the account was created
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)  # Timestamp of when the account was updated
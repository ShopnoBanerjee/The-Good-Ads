from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Business-specific fields
    business_type = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)

    owner_id = Column(String, ForeignKey("user.id"), nullable=False)

    owner = relationship("User", backref="businesses")
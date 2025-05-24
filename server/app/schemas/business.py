from pydantic import BaseModel
from typing import Optional

class BusinessBase(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    business_type: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BusinessBase):
    pass

class BusinessInDBBase(BusinessBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class Business(BusinessInDBBase):
    pass

class BusinessInDB(BusinessInDBBase):
    pass
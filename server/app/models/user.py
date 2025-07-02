from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    user_type: str  # 'college_society' or 'business'

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

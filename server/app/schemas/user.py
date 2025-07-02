from pydantic import BaseModel

class UserSchema(BaseModel):
    email: str
    user_type: str

class UserCreateSchema(UserSchema):
    password: str

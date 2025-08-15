from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreateSchema, UserSchema
from app.services.supabase_service import supabase

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserSchema)
def register_user(user: UserCreateSchema):
    # Example: Insert user into Supabase
    data = {
        "email": user.email,
        "user_type": user.user_type,
        "password": user.password  # In production, hash the password!
    }
    response = supabase.table("users").insert(data).execute()
    if response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    return user

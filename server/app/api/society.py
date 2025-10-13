from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt
import logging

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
logger = logging.getLogger(__name__)


@router.get("/api/society-profile")
async def get_society_profile(authorization: str = Header(...)):
    """
    Get the current user's society profile
    """
    try:
        # Verify JWT
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Bearer token")

        token = authorization.split(" ")[1]
        user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

        # Query the college_society_profiles table
        result = supabase.table("college_society_profiles").select("*").eq("id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Society profile not found")

        profile = result.data[0]
        return profile

    except Exception as e:
        logger.error(f"Error fetching society profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch society profile")

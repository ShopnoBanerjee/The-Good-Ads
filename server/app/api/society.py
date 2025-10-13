from fastapi import APIRouter, Header, HTTPException, Request
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


@router.put("/api/society-profile")
async def update_society_profile(request: Request, authorization: str = Header(...)):
    """
    Update the current user's society profile
    """
    try:
        # Verify JWT
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Bearer token")

        token = authorization.split(" ")[1]
        user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

        # Get the update data
        body = await request.json()

        # Validate and typecast the data
        update_data = {}

        # Required string fields
        required_string_fields = ['society_name', 'poc_name', 'phone_number', 'establishment_date', 'state', 'city']
        for field in required_string_fields:
            if field in body:
                if not isinstance(body[field], str) or not body[field].strip():
                    raise HTTPException(status_code=400, detail=f"{field} must be a non-empty string")
                update_data[field] = body[field].strip()

        # Optional string fields
        optional_string_fields = ['college_name', 'description']
        for field in optional_string_fields:
            if field in body:
                if body[field] is not None:
                    if not isinstance(body[field], str):
                        raise HTTPException(status_code=400, detail=f"{field} must be a string or null")
                    update_data[field] = body[field].strip() if body[field].strip() else None
                else:
                    update_data[field] = None

        # Array fields
        array_fields = ['domains', 'services_offered']
        for field in array_fields:
            if field in body:
                if not isinstance(body[field], list):
                    raise HTTPException(status_code=400, detail=f"{field} must be an array")
                # Ensure all items are strings
                if not all(isinstance(item, str) for item in body[field]):
                    raise HTTPException(status_code=400, detail=f"All items in {field} must be strings")
                update_data[field] = [item.strip() for item in body[field] if item.strip()]

        # Integer field
        if 'total_member_count' in body:
            if not isinstance(body['total_member_count'], int) or body['total_member_count'] < 0:
                raise HTTPException(status_code=400, detail="total_member_count must be a non-negative integer")
            update_data['total_member_count'] = body['total_member_count']

        # Remove any fields that are None or empty
        update_data = {k: v for k, v in update_data.items() if v is not None and (not isinstance(v, list) or v)}

        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        # Update the college_society_profiles table
        result = supabase.table("college_society_profiles").update(update_data).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Society profile not found")

        return {"message": "Profile updated successfully", "profile": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating society profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update society profile")

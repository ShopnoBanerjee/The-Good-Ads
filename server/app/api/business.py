from fastapi import APIRouter, Header, HTTPException, Request
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt
import logging

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
logger = logging.getLogger(__name__)


@router.get("/api/business-profile")
async def get_business_profile(authorization: str = Header(...)):
    """
    Get the current user's business profile
    """
    try:
        # Verify JWT
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Bearer token")

        token = authorization.split(" ")[1]
        user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

        # Query the business_profiles table
        result = supabase.table("business_profiles").select("*").eq("id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Business profile not found")

        profile = result.data[0]
        return profile

    except Exception as e:
        logger.error(f"Error fetching business profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch business profile")


@router.put("/api/business-profile")
async def update_business_profile(request: Request, authorization: str = Header(...)):
    """
    Update the current user's business profile
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
        required_string_fields = ['business_name', 'poc_name', 'phone_number', 'establishment_date', 'state', 'city', 'industry_sector', 'company_type', 'poc_role']
        for field in required_string_fields:
            if field in body:
                if not isinstance(body[field], str) or not body[field].strip():
                    raise HTTPException(status_code=400, detail=f"{field} must be a non-empty string")
                update_data[field] = body[field].strip()

        # Optional string fields
        optional_string_fields = ['description']
        for field in optional_string_fields:
            if field in body:
                if body[field] is not None:
                    if not isinstance(body[field], str):
                        raise HTTPException(status_code=400, detail=f"{field} must be a string or null")
                    update_data[field] = body[field].strip() if body[field].strip() else None
                else:
                    update_data[field] = None

        # Array fields
        array_fields = ['domains', 'objectives']
        for field in array_fields:
            if field in body:
                if body[field] is None:
                    update_data[field] = None
                elif not isinstance(body[field], list):
                    raise HTTPException(status_code=400, detail=f"{field} must be an array or null")
                else:
                    # Ensure all items are strings
                    if not all(isinstance(item, str) for item in body[field]):
                        raise HTTPException(status_code=400, detail=f"All items in {field} must be strings")
                    # Process the array, filtering out empty strings
                    processed_array = [item.strip() for item in body[field] if item.strip()]
                    update_data[field] = processed_array

        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        # Update the business_profiles table
        result = supabase.table("business_profiles").update(update_data).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Business profile not found")

        return {"message": "Profile updated successfully", "profile": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating business profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update business profile")
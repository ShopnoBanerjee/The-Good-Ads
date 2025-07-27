from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.get("/api/marketplace-projects")
async def get_marketplace_projects(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm this is a society user
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only college societies can view marketplace projects")

    # ✅ Return all published projects
    resp = supabase.table("projects").select(
        "id, compliant_name, compliant_description, services_required"
    ).eq("status", "published").execute()
    print(resp)

    return resp.data



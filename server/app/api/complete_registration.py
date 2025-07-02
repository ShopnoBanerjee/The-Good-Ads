from fastapi import APIRouter, Request, Header, HTTPException, status
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


@router.post("/api/complete-registration")
async def complete_registration(request: Request, authorization: str = Header(...)):
    body = await request.json()

    user_type = body.get("userType")
    if user_type not in ["business", "college_society"]:
        raise HTTPException(status_code=400, detail="Invalid user type")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ ✅ ✅ Always upsert parent first!
    profiles_resp = supabase.table("profiles").upsert({
        "id": user_id,
        "user_type": user_type,
    }).execute()

    if getattr(profiles_resp, "error", None):
        raise HTTPException(status_code=500, detail=f"Profiles upsert failed: {profiles_resp.error}")

    if user_type == "business":
        profile_data = {
            "id": user_id,
            "business_name": body.get("business_name"),
            "poc_name": body.get("poc_name"),
            "phone_number": body.get("phone_number"),
            "domain": body.get("domain"),
        }
        resp = supabase.table("business_profiles").upsert(profile_data).execute()

    elif user_type == "college_society":
        profile_data = {
            "id": user_id,
            "society_name": body.get("society_name"),
            "poc_name": body.get("poc_name"),
            "phone_number": body.get("phone_number"),
            "domain": body.get("domain"),
            "services_offered": body.get("services_offered"),
        }
        resp = supabase.table("college_society_profiles").upsert(profile_data).execute()

    if getattr(resp, "error", None):
        raise HTTPException(status_code=500, detail=f"Child upsert failed: {resp.error}")

    return {"message": "Registration complete"}

from fastapi import APIRouter, Header, Request, HTTPException, Response
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.options("/api/post-login")
def options_post_login():
    return Response(status_code=204)

@router.post("/api/post-login")
async def post_login(request: Request, authorization: str = Header(...)):
    body = await request.json()
    user_type = body.get("userType")
    if user_type not in ["business", "college_society"]:
        raise HTTPException(status_code=400, detail="Invalid user type.")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token.")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Upsert profile
    resp = supabase.table("profiles").upsert({
        "id": user_id,
        "user_type": user_type,
    }).execute()
    if getattr(resp, "error", None):
        raise HTTPException(status_code=500, detail=str(resp.error))

    return {"message": "Profile updated."}

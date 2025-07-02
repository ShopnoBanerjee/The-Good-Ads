from fastapi import APIRouter, Request, Header, HTTPException, status
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# ✅ Dummy AI agent for now
def run_ai_moderation(raw_name, raw_description):
    # Simulate redacting sensitive info
    safe_name = raw_name.replace("AcmeCorp", "[REDACTED]")
    safe_description = raw_description.replace("AcmeCorp", "[REDACTED]")
    return safe_name, safe_description


@router.post("/api/create-project")
async def create_project(request: Request, authorization: str = Header(...)):
    body = await request.json()

    # ✅ Validate fields exist
    raw_name = body.get("name")
    services_required = body.get("services_required")
    raw_description = body.get("description")

    if not raw_name or not services_required or not raw_description:
        raise HTTPException(status_code=400, detail="Missing fields")

    # ✅ Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm user is business
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if profile.data is None or profile.data["user_type"] != "business":
        raise HTTPException(status_code=403, detail="Only business users can create projects")

    # ✅ Call AI agent
    compliant_name, compliant_description = run_ai_moderation(raw_name, raw_description)

    insert_resp = supabase.table("projects").insert({
        "business_id": user_id,
        "raw_name": raw_name,
        "raw_description": raw_description,
        "services_required": services_required,
        "compliant_name": compliant_name,
        "compliant_description": compliant_description,
        "status": "approved"
    }).execute()

    print("INSERT RESPONSE:", insert_resp)

    if not insert_resp.data:
        raise HTTPException(status_code=500, detail=f"Insertion failed: {insert_resp}")

    project_id = insert_resp.data[0]["id"]


    return {
        "project_id": project_id,
        "compliant_name": compliant_name,
        "compliant_description": compliant_description
    }
    
@router.post("/api/confirm-project")
async def confirm_project(request: Request, authorization: str = Header(...)):
    body = await request.json()
    project_id = body.get("project_id")

    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID is required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Fetch the project
    resp = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = resp.data

    if project["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if project["status"] not in ["approved", "pending_review"]:
        raise HTTPException(status_code=400, detail="Project cannot be confirmed in current state")

    update = supabase.table("projects").update({
        "status": "published"
    }).eq("id", project_id).execute()

    if not update.data:
        raise HTTPException(status_code=500, detail="Failed to update project status.")

    return {"message": "Project published successfully"}

@router.get("/api/get-project")
async def get_project(project_id: str, authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    resp = supabase.table("projects").select("*").eq("id", project_id).single().execute()

    if not resp.data:
        raise HTTPException(status_code=404, detail="Project not found")

    if resp.data["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return resp.data

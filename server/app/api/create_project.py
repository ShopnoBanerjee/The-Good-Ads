from fastapi import APIRouter, Request, Header, HTTPException, status
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client
from groq import AsyncGroq

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def run_ai_moderation(raw_name, raw_description):
    print("[run_ai_moderation] Called with:", raw_name, raw_description)
    api_key = getattr(settings, "GROQ_API_KEY", None)
    print("[run_ai_moderation] Using API key:", "SET" if api_key else "NOT SET")
    if not api_key:
        print("[run_ai_moderation] No API key found, returning raw values")
        return raw_name, raw_description
    client = AsyncGroq(api_key=api_key)
    prompt = (
        "Redact all sensitive information (company names, emails, phone numbers, personal names) from the following text. "
        "Replace each with [REDACTED].\nName: " + raw_name + "\nDescription: " + raw_description
    )
    print("[run_ai_moderation] Prompt:", prompt)
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a compliance assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        stream=False
    )
    print("[run_ai_moderation] AI response:", response)
    ai_text = response.choices[0].message.content
    print("[run_ai_moderation] AI text:", ai_text)
    safe_name = raw_name
    safe_description = raw_description
    for line in ai_text.splitlines():
        if line.lower().startswith("name:"):
            safe_name = line.split(":",1)[1].strip()
            print("[run_ai_moderation] Parsed safe_name:", safe_name)
        elif line.lower().startswith("description:"):
            safe_description = line.split(":",1)[1].strip()
            print("[run_ai_moderation] Parsed safe_description:", safe_description)
    print("[run_ai_moderation] Returning:", safe_name, safe_description)
    return safe_name, safe_description


@router.post("/api/create-project")
async def create_project(request: Request, authorization: str = Header(...)):
    body = await request.json()

    # ✅ Validate fields exist
    raw_name = body.get("name")
    services_required = body.get("services_required")
    raw_description = body.get("description")
    hide_details = body.get("hide_details", False)

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

    # ✅ Call AI agent for compliance if hide_details is True
    if hide_details:
        compliant_name, compliant_description = await run_ai_moderation(raw_name, raw_description)
    else:
        compliant_name, compliant_description = raw_name, raw_description

    insert_resp = supabase.table("projects").insert({
        "business_id": user_id,
        "raw_name": raw_name,
        "raw_description": raw_description,
        "services_required": services_required,
        "compliant_name": compliant_name,
        "compliant_description": compliant_description,
        "status": "pending_review"
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

    print(f"[confirm-project] Received request with project_id: {project_id}")

    if not project_id:
        print("[confirm-project] ERROR: Project ID is missing")
        raise HTTPException(status_code=400, detail="Project ID is required")

    if not authorization.startswith("Bearer "):
        print("[confirm-project] ERROR: Missing Bearer token")
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)
    print(f"[confirm-project] User ID from JWT: {user_id}")

    # ✅ Fetch the project
    resp = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not resp.data:
        print(f"[confirm-project] ERROR: Project not found with ID: {project_id}")
        raise HTTPException(status_code=404, detail="Project not found")

    project = resp.data
    print(f"[confirm-project] Project found: {project}")
    print(f"[confirm-project] Project status: {project.get('status')}")
    print(f"[confirm-project] Project business_id: {project.get('business_id')}")

    if project["business_id"] != user_id:
        print(f"[confirm-project] ERROR: User {user_id} not authorized for project owned by {project['business_id']}")
        raise HTTPException(status_code=403, detail="Not authorized")

    if project["status"] not in ["approved", "pending_review", "published"]:
        print(f"[confirm-project] ERROR: Invalid project status '{project['status']}' for confirmation")
        raise HTTPException(status_code=400, detail="Project cannot be confirmed in current state")

    # If already published, just return success
    if project["status"] == "published":
        print("[confirm-project] SUCCESS: Project is already published")
        return {"message": "Project is already published"}

    print("[confirm-project] Updating project status to published")
    update = supabase.table("projects").update({
        "status": "published"
    }).eq("id", project_id).execute()

    if not update.data:
        print("[confirm-project] ERROR: Failed to update project status")
        raise HTTPException(status_code=500, detail="Failed to update project status.")

    print("[confirm-project] SUCCESS: Project published successfully")
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

@router.delete("/api/delete-project")
async def delete_project(request: Request, authorization: str = Header(...)):
    body = await request.json()
    project_id = body.get("project_id")

    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID is required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Confirm user owns the project
    resp = supabase.table("projects").select("business_id").eq("id", project_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if resp.data["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    delete_resp = supabase.table("projects").delete().eq("id", project_id).execute()
    if not delete_resp.data:
        raise HTTPException(status_code=500, detail="Failed to delete project.")

    return {"message": "Project deleted successfully"}

@router.put("/api/edit-project")
async def edit_project(request: Request, authorization: str = Header(...)):
    body = await request.json()
    project_id = body.get("project_id")
    raw_name = body.get("name")
    raw_description = body.get("description")
    services_required = body.get("services_required")
    hide_details = body.get("hide_details", False)
    status = body.get("status")

    if not project_id or not raw_name or not raw_description or not services_required:
        raise HTTPException(status_code=400, detail="Missing fields")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Confirm user owns the project
    resp = supabase.table("projects").select("business_id").eq("id", project_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if resp.data["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Call AI agent for compliance if hide_details is True
    if hide_details:
        compliant_name, compliant_description = await run_ai_moderation(raw_name, raw_description)
    else:
        compliant_name, compliant_description = raw_name, raw_description

    update_resp = supabase.table("projects").update({
        "raw_name": raw_name,
        "raw_description": raw_description,
        "services_required": services_required,
        "compliant_name": compliant_name,
        "compliant_description": compliant_description,
        **({"status": status} if status else {})
    }).eq("id", project_id).execute()

    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update project.")

    return {
        "message": "Project updated successfully",
        "compliant_name": compliant_name,
        "compliant_description": compliant_description
    }

@router.get("/api/business-projects")
async def get_business_projects(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify user is a business
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "business":
        raise HTTPException(status_code=403, detail="Only business users can access this endpoint")

    # Get projects owned by this business user
    resp = supabase.table("projects").select("*").eq("business_id", user_id).execute()

    return resp.data or []

@router.get("/api/society-projects")
async def get_society_projects(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify user is a society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only society users can access this endpoint")

    # Get projects assigned to this society user (through proposals that were accepted)
    # First get accepted proposals for this society
    proposals_resp = supabase.table("proposals").select("project_id").eq("society_id", user_id).eq("status", "accepted").execute()

    if not proposals_resp.data:
        return []

    project_ids = [p["project_id"] for p in proposals_resp.data]

    # Get the actual project details
    projects_resp = supabase.table("projects").select("*").in_("id", project_ids).execute()

    return projects_resp.data or []
from fastapi import APIRouter, Request, Header, HTTPException, status
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


@router.post("/api/create-project")
async def create_project(request: Request, authorization: str = Header(...)):
    body = await request.json()

    # ✅ Validate fields exist
    description = body.get("description")
    domains = body.get("domains", [])
    services_offered = body.get("services_offered", [])
    budget = body.get("budget")
    hide_details = body.get("hide_details", False)

    if not description or not domains or not services_offered or budget is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # ✅ Validate budget
    try:
        budget = float(budget)
        if budget <= 1000:
            raise HTTPException(status_code=400, detail="Budget must be greater than 1000")
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid budget format")

    # ✅ Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm user is business
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if profile.data is None or profile.data["user_type"] != "business":
        raise HTTPException(status_code=403, detail="Only business users can create projects")

    insert_resp = supabase.table("projects").insert({
        "business_id": user_id,
        "description": description,
        "domains": domains,
        "services_offered": services_offered,
        "budget": budget,
        "status": "draft"
    }).execute()

    print("INSERT RESPONSE:", insert_resp)

    if not insert_resp.data:
        raise HTTPException(status_code=500, detail=f"Insertion failed: {insert_resp}")

    project_id = insert_resp.data[0]["id"]

    return {
        "project_id": project_id
    }


@router.post("/api/submit-rating")
async def submit_rating(request: Request, authorization: str = Header(...)):
    body = await request.json()

    # Validate fields
    project_id = body.get("project_id")
    ratee_id = body.get("ratee_id")
    communication_rating = body.get("communication_rating")
    quality_rating = body.get("quality_rating")
    timeliness_rating = body.get("timeliness_rating")
    overall_rating = body.get("overall_rating")
    review_text = body.get("review_text")

    if not project_id or not ratee_id or communication_rating is None or quality_rating is None or timeliness_rating is None or overall_rating is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if not all(1 <= r <= 5 for r in [communication_rating, quality_rating, timeliness_rating, overall_rating]):
        raise HTTPException(status_code=400, detail="All ratings must be between 1 and 5")

    # Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Validate that the user is involved in this project
    project_resp = supabase.table("projects").select("business_id, society_id, status").eq("id", project_id).single().execute()
    if not project_resp.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data
    if project["business_id"] != user_id and project["society_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to rate this project")

    if project["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed projects")

    # Check if user has already rated
    existing = supabase.table("ratings").select("id").eq("project_id", project_id).eq("rater_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already rated this project")

    # Insert rating
    insert_resp = supabase.table("ratings").insert({
        "project_id": project_id,
        "rater_id": user_id,
        "ratee_id": ratee_id,
        "communication_rating": communication_rating,
        "quality_rating": quality_rating,
        "timeliness_rating": timeliness_rating,
        "overall_rating": overall_rating,
        "review_text": review_text,
        "is_visible": True,
    }).execute()

    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to submit rating")

    return insert_resp.data[0]
    
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

    if project["status"] not in ["draft", "published"]:
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
    description = body.get("description")
    domains = body.get("domains", [])
    services_offered = body.get("services_offered", [])
    budget = body.get("budget")
    hide_details = body.get("hide_details", False)
    status = body.get("status")

    if not project_id or not description or not domains or not services_offered or budget is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # ✅ Validate budget
    try:
        budget = float(budget)
        if budget <= 1000:
            raise HTTPException(status_code=400, detail="Budget must be greater than 1000")
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid budget format")

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

    update_resp = supabase.table("projects").update({
        "description": description,
        "domains": domains,
        "services_offered": services_offered,
        "budget": budget,
        **({"status": status} if status else {})
    }).eq("id", project_id).execute()

    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update project.")

    return {"message": "Project updated successfully"}

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
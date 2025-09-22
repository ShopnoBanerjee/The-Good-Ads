from fastapi import APIRouter, Header, HTTPException, Request
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.post("/api/send-proposal")
async def send_proposal(request: Request, authorization: str = Header(...)):
    body = await request.json()
    project_id = body.get("project_id")
    pitch = body.get("pitch")

    if not project_id or not pitch:
        raise HTTPException(status_code=400, detail="Project ID and pitch required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can send proposals")

    # ✅ Insert proposal
    resp = supabase.table("proposals").insert({
        "project_id": project_id,
        "society_id": user_id,
        "pitch": pitch,
        "status": "submitted"
    }).execute()

    if not resp.data:
        raise HTTPException(status_code=500, detail="Proposal insert failed")

    return {"message": "Proposal sent successfully"}

@router.get("/api/business-proposals")
async def get_business_proposals(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Must be business user
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "business":
        raise HTTPException(status_code=403, detail="Only businesses can view")

    # ✅ Get all proposals for my projects
    resp = supabase.from_("proposals").select("""
        *,
        projects!inner(id, compliant_name)
    """).eq("projects.business_id", user_id).execute()

    if resp.error:
        raise HTTPException(status_code=500, detail=str(resp.error))

    return resp.data

@router.post("/api/accept-proposal")
async def accept_proposal(request: Request, authorization: str = Header(...)):
    body = await request.json()
    proposal_id = body.get("proposal_id")

    if not proposal_id:
        raise HTTPException(status_code=400, detail="Missing proposal_id")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Confirm project belongs to this business
    proposal = supabase.table("proposals").select("*").eq("id", proposal_id).single().execute()
    if not proposal.data:
        raise HTTPException(status_code=404, detail="Proposal not found")

    project_id = proposal.data["project_id"]

    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update = supabase.table("proposals").update({"status": "accepted"}).eq("id", proposal_id).execute()

    # Update project with society_id
    society_id = proposal.data["society_id"]
    supabase.table("projects").update({"society_id": society_id}).eq("id", project_id).execute()

    business_id = user_id

    # Check if conversation already exists
    existing_conversation = supabase.table("conversations").select("*").eq("project_id", project_id).execute()

    if not existing_conversation.data:
        conversation_data = {
            "project_id": project_id,
            "business_id": business_id,
            "society_id": society_id
        }
        conversation_response = supabase.table("conversations").insert(conversation_data).execute()
        conversation_id = conversation_response.data[0]["id"] if conversation_response.data else None
    else:
        conversation_id = existing_conversation.data[0]["id"]

    return {"message": "Proposal accepted", "conversation_id": conversation_id}

@router.get("/api/business-projects")
async def get_business_projects(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "business":
        raise HTTPException(status_code=403, detail="Only businesses can view")

    projects = supabase.table("projects").select("*").eq("business_id", user_id).execute()

    return projects.data

@router.get("/api/project-proposals")
async def get_project_proposals(project_id: str, authorization: str = Header(...)):
    if not project_id:
        raise HTTPException(status_code=400, detail="Missing project_id")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Confirm project belongs to this business
    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view proposals for this project")

    proposals = supabase.table("proposals").select("*").eq("project_id", project_id).execute()
    return proposals.data




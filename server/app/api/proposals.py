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

    # ✅ Check if proposal already exists for this project and society
    existing_proposal = supabase.table("proposals").select("id").eq("project_id", project_id).eq("society_id", user_id).execute()
    if existing_proposal.data and len(existing_proposal.data) > 0:
        raise HTTPException(status_code=400, detail="You have already sent a proposal for this project")

    # ✅ Insert proposal
    resp = supabase.table("proposals").insert({
        "project_id": project_id,
        "society_id": user_id,
        "pitch": pitch,
        "status": "submitted"
    }).execute()

    if not resp.data:
        raise HTTPException(status_code=500, detail="Proposal insert failed")

    # ✅ Increment proposal count on project
    current = supabase.table("projects").select("proposal_count").eq("id", project_id).single().execute()
    count = current.data["proposal_count"] if current.data else 0
    supabase.table("projects").update({"proposal_count": count + 1}).eq("id", project_id).execute()

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

    # Get proposals first
    proposals = supabase.table("proposals").select("*").eq("project_id", project_id).execute()
    
    # For each proposal, get the society name from college_society_profiles
    enhanced_proposals = []
    for proposal in proposals.data:
        society_profile = supabase.table("college_society_profiles").select("society_name").eq("id", proposal["society_id"]).single().execute()
        society_name = society_profile.data["society_name"] if society_profile.data else f"Society {proposal['society_id']}"
        
        enhanced_proposal = {**proposal, "society_name": society_name}
        enhanced_proposals.append(enhanced_proposal)
    
    return enhanced_proposals

@router.get("/api/society-projects")
async def get_society_projects(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can view")

    projects = supabase.table("projects").select("*").eq("society_id", user_id).execute()

    return projects.data


@router.get("/api/check-proposal-status/{project_id}")
async def check_proposal_status(project_id: str, authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can check proposal status")

    # ✅ Check if proposal exists
    existing_proposal = supabase.table("proposals").select("id, status, created_at").eq("project_id", project_id).eq("society_id", user_id).execute()

    if existing_proposal.data and len(existing_proposal.data) > 0:
        proposal = existing_proposal.data[0]
        return {
            "has_proposal": True,
            "status": proposal["status"],
            "created_at": proposal["created_at"]
        }

    return {"has_proposal": False}




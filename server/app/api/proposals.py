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

@router.post("/api/express-interest")
async def express_interest(request: Request, authorization: str = Header(...)):
    body = await request.json()
    project_id = body.get("project_id")

    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can express interest")

    # ✅ Check if proposal already exists for this project and society
    existing_proposal = supabase.table("proposals").select("id").eq("project_id", project_id).eq("society_id", user_id).execute()
    if existing_proposal.data and len(existing_proposal.data) > 0:
        raise HTTPException(status_code=400, detail="You have already expressed interest in this project")

    # ✅ Get society profile details
    society_profile = supabase.table("college_society_profiles").select("*").eq("id", user_id).single().execute()
    if not society_profile.data:
        raise HTTPException(status_code=404, detail="Society profile not found. Please complete your registration.")

    # ✅ Create comprehensive proposal with all society details
    proposal_data = {
        "project_id": project_id,
        "society_id": user_id,
        "status": "submitted",
        "society_details": {
            "society_name": society_profile.data.get("society_name"),
            "poc_name": society_profile.data.get("poc_name"),
            "phone_number": society_profile.data.get("phone_number"),
            "establishment_date": society_profile.data.get("establishment_date"),
            "state": society_profile.data.get("state"),
            "city": society_profile.data.get("city"),
            "domains": society_profile.data.get("domains", []),
            "services_offered": society_profile.data.get("services_offered", []),
            "total_member_count": society_profile.data.get("total_member_count"),
            "college_name": society_profile.data.get("college_name")
        }
    }

    # ✅ Insert proposal with society details
    resp = supabase.table("proposals").insert(proposal_data).execute()

    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to express interest")

    # ✅ Increment proposal count on project
    current = supabase.table("projects").select("proposal_count").eq("id", project_id).single().execute()
    count = current.data["proposal_count"] if current.data else 0
    supabase.table("projects").update({"proposal_count": count + 1}).eq("id", project_id).execute()

    # Update project with society_id
    supabase.table("projects").update({"society_id": user_id}).eq("id", project_id).execute()

    return {"message": "Interest expressed successfully", "proposal_id": resp.data[0]["id"]}

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

    # ✅ Get all proposals for my projects with society details
    resp = supabase.from_("proposals").select("""
        *,
        projects!inner(id, description)
    """).eq("projects.business_id", user_id).execute()

    if resp.error:
        raise HTTPException(status_code=500, detail=str(resp.error))

    # ✅ Enhance proposals with society profile information
    enhanced_proposals = []
    for proposal in resp.data:
        society_details = proposal.get("society_details", {})
        enhanced_proposal = {
            **proposal,
            "society_name": society_details.get("society_name", "Unknown Society"),
            "poc_name": society_details.get("poc_name"),
            "establishment_date": society_details.get("establishment_date"),
            "state": society_details.get("state"),
            "city": society_details.get("city"),
            "society_domains": society_details.get("domains", []),
            "society_services_offered": society_details.get("services_offered", []),
            "total_member_count": society_details.get("total_member_count"),
            "college_name": society_details.get("college_name")
        }
        enhanced_proposals.append(enhanced_proposal)

    return enhanced_proposals

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

    # Check if project already has an accepted proposal
    existing_accepted = supabase.table("proposals").select("id").eq("project_id", project_id).eq("status", "accepted").execute()
    if existing_accepted.data and len(existing_accepted.data) > 0:
        raise HTTPException(status_code=400, detail="A proposal has already been accepted for this project")

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

    # Enhance projects with proposal acceptance status
    enhanced_projects = []
    for project in projects.data:
        # Check if project has an accepted proposal
        accepted_proposal = supabase.table("proposals").select("id, society_id").eq("project_id", project["id"]).eq("status", "accepted").execute()
        has_accepted_proposal = len(accepted_proposal.data) > 0 if accepted_proposal.data else False
        
        enhanced_project = {**project, "has_accepted_proposal": has_accepted_proposal}
        enhanced_projects.append(enhanced_project)

    return enhanced_projects

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

    # Get proposals for this project
    proposals = supabase.table("proposals").select("*").eq("project_id", project_id).execute()

    # Enhance proposals with society details from the stored society_details field
    enhanced_proposals = []
    for proposal in proposals.data:
        society_details = proposal.get("society_details", {})
        enhanced_proposal = {
            **proposal,
            "society_name": society_details.get("society_name", f"Society {proposal['society_id']}"),
            "poc_name": society_details.get("poc_name"),
            "establishment_date": society_details.get("establishment_date"),
            "state": society_details.get("state"),
            "city": society_details.get("city"),
            "society_domains": society_details.get("domains", []),
            "society_services_offered": society_details.get("services_offered", []),
            "total_member_count": society_details.get("total_member_count"),
            "college_name": society_details.get("college_name")
        }
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




from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


# Add pagination: page (default 1), page_size (default 10)
from fastapi import Query

@router.get("/api/marketplace-projects")
async def get_marketplace_projects(
    authorization: str = Header(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm this is a society user
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only college societies can view marketplace projects")

    # ✅ Return all published projects with pagination
    start = (page - 1) * page_size
    end = start + page_size - 1
    query = supabase.table("projects").select(
        "id, description, domains, services_offered, budget, created_at, proposal_count"
    ).eq("status", "published").range(start, end)
    resp = query.execute()

    # Get total count for pagination
    count_query = supabase.table("projects").select("id", count="exact").eq("status", "published")
    count_resp = count_query.execute()
    total = count_resp.count if hasattr(count_resp, "count") else None

    return {
        "projects": resp.data,
        "page": page,
        "page_size": page_size,
        "total": total
    }



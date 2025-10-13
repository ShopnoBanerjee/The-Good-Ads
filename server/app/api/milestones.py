from fastapi import APIRouter, Request, Header, HTTPException, status
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client
from typing import List, Optional
from datetime import datetime

router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
@router.get("/api/milestones")
async def get_milestones(project_id: str, authorization: str = Header(...)):
    """Get all milestones for a project"""

    # Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify user owns the project (either as business owner or through accepted proposal)
    project_resp = supabase.table("projects").select("business_id").eq("id", project_id).single().execute()

    if project_resp.data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data

    # Check if user is business owner
    is_business_owner = project["business_id"] == user_id

    # Check if user is society user with accepted proposal for this project
    is_society_user = False
    if not is_business_owner:
        proposal_resp = supabase.table("proposals").select("status").eq("project_id", project_id).eq("society_id", user_id).eq("status", "accepted").execute()
        is_society_user = len(proposal_resp.data) > 0

    if not is_business_owner and not is_society_user:
        raise HTTPException(status_code=403, detail="You don't have permission to view milestones for this project")

    # Fetch milestones with tasks
    milestones_resp = supabase.table("milestones").select("""
        *,
        tasks (*)
    """).eq("project_id", project_id).order("created_at").execute()

    if milestones_resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch milestones")

    # Format the response
    milestones = []
    for milestone in milestones_resp.data or []:
        milestones.append({
            **milestone,
            "tasks": milestone.get("tasks", [])
        })

    return milestones


@router.post("/api/milestones")
async def create_milestone(request: Request, authorization: str = Header(...)):
    """Create a new milestone with associated tasks"""
    body = await request.json()

    # Validate required fields
    project_id = body.get("project_id")
    title = body.get("title")
    tasks = body.get("tasks", [])
    description = body.get("description")
    due_date = body.get("due_date")

    if not project_id or not title or not tasks:
        raise HTTPException(status_code=400, detail="Missing required fields: project_id, title, tasks")

    if not isinstance(tasks, list) or len(tasks) == 0:
        raise HTTPException(status_code=400, detail="Tasks must be a non-empty array")

    # Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify user owns the project (either as business owner or through accepted proposal)
    project_resp = supabase.table("projects").select("business_id").eq("id", project_id).single().execute()

    if project_resp.data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data

    # Check if user is business owner
    is_business_owner = project["business_id"] == user_id

    # Check if user is society user with accepted proposal for this project
    is_society_user = False
    if not is_business_owner:
        proposal_resp = supabase.table("proposals").select("status").eq("project_id", project_id).eq("society_id", user_id).eq("status", "accepted").execute()
        is_society_user = len(proposal_resp.data) > 0

    if not is_business_owner and not is_society_user:
        raise HTTPException(status_code=403, detail="You don't have permission to create milestones for this project")

    try:
        # Create milestone
        milestone_data = {
            "project_id": project_id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "status": "in_progress",
            "created_at": datetime.utcnow().isoformat()
        }

        milestone_resp = supabase.table("milestones").insert(milestone_data).execute()

        if not milestone_resp.data:
            raise HTTPException(status_code=500, detail="Failed to create milestone")

        milestone = milestone_resp.data[0]

        # Create tasks
        tasks_data = []
        for task_desc in tasks:
            if isinstance(task_desc, str) and task_desc.strip():
                tasks_data.append({
                    "milestone_id": milestone["id"],
                    "description": task_desc.strip(),
                    "is_completed": False,
                    "created_at": datetime.utcnow().isoformat()
                })

        if tasks_data:
            tasks_resp = supabase.table("tasks").insert(tasks_data).execute()

            if not tasks_resp.data:
                # If tasks creation fails, we should probably delete the milestone
                # But for now, let's just log and continue
                print(f"Warning: Failed to create tasks for milestone {milestone['id']}")
                tasks_resp.data = []

            milestone["tasks"] = tasks_resp.data
        else:
            milestone["tasks"] = []

        return milestone

    except Exception as e:
        print(f"Error creating milestone: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create milestone: {str(e)}")


@router.put("/api/milestones/{milestone_id}/status")
async def update_milestone_status(milestone_id: str, request: Request, authorization: str = Header(...)):
    """Update milestone status"""
    body = await request.json()
    new_status = body.get("status")

    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status field")

    valid_statuses = [ "in_progress", "awaiting_confirmation", "completed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    # Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Get milestone and verify ownership
    milestone_resp = supabase.table("milestones").select("*, projects(business_id)").eq("id", milestone_id).single().execute()

    if milestone_resp.data is None:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = milestone_resp.data
    project_id = milestone["project_id"]

    # Check project ownership
    project_resp = supabase.table("projects").select("business_id").eq("id", project_id).single().execute()

    if project_resp.data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data

    # Check if user is business owner
    is_business_owner = project["business_id"] == user_id

    # Check if user is society user with accepted proposal for this project
    is_society_user = False
    if not is_business_owner:
        proposal_resp = supabase.table("proposals").select("status").eq("project_id", project_id).eq("society_id", user_id).eq("status", "accepted").execute()
        is_society_user = len(proposal_resp.data) > 0

    if not is_business_owner and not is_society_user:
        raise HTTPException(status_code=403, detail="You don't have permission to update this milestone")

    # Additional validation for status transitions
    current_status = milestone["status"]

    # Only business owners can confirm completion (move to completed status)
    if new_status == "completed" and not is_business_owner:
        raise HTTPException(status_code=403, detail="Only business owners can confirm milestone completion")

    # Can only move to completed from awaiting_confirmation
    if new_status == "completed" and current_status != "awaiting_confirmation":
        raise HTTPException(status_code=400, detail="Can only confirm completion for milestones awaiting confirmation")

    # Update milestone status
    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    }

    update_resp = supabase.table("milestones").update(update_data).eq("id", milestone_id).execute()

    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update milestone status")

    return update_resp.data[0]


@router.put("/api/tasks/{task_id}/toggle")
async def toggle_task_completion(task_id: str, authorization: str = Header(...)):
    """Toggle task completion status"""

    # 🔐 Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # 🧾 Fetch task + its project (via milestone relation)
    task_resp = (
        supabase.table("tasks")
        .select("*, milestones(project_id)")
        .eq("id", task_id)
        .single()
        .execute()
    )

    if task_resp.data is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task = task_resp.data
    project_id = task["milestones"]["project_id"]

    # 🧭 Verify project ownership or accepted society link
    project_resp = (
        supabase.table("projects")
        .select("business_id")
        .eq("id", project_id)
        .single()
        .execute()
    )

    if project_resp.data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data
    is_business_owner = project["business_id"] == user_id

    # Check if society user has accepted proposal
    is_society_user = False
    if not is_business_owner:
        proposal_resp = (
            supabase.table("proposals")
            .select("status")
            .eq("project_id", project_id)
            .eq("society_id", user_id)
            .eq("status", "accepted")
            .execute()
        )
        is_society_user = len(proposal_resp.data) > 0

    if not is_business_owner and not is_society_user:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this task",
        )

    # ✅ Toggle completion status
    new_status = not task["is_completed"]
    update_data = {
        "is_completed": new_status,
        "completed_at": datetime.utcnow().isoformat() if new_status else None,
    }

    update_resp = (
        supabase.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .execute()
    )

    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update task")

    updated_task = (
        update_resp.data[0] if isinstance(update_resp.data, list) else update_resp.data
    )

    # 🧩 Milestone status update is now handled automatically by the database trigger
    # So we just return the updated task

    return {
        **updated_task,
        "message": f"Task {'completed' if new_status else 'reopened'} successfully. Milestone status will auto-update if needed."
    }


@router.post("/api/complete-project")
async def complete_project(request: Request, authorization: str = Header(...)):
    """Complete a project after verifying all milestones are completed"""
    body = await request.json()
    project_id = body.get("project_id")

    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID is required")

    # Check JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify user owns the project
    project_resp = supabase.table("projects").select("business_id, status").eq("id", project_id).single().execute()

    if project_resp.data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_resp.data

    # Check if user is business owner
    if project["business_id"] != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to complete this project")

    # Check if project is already completed
    if project["status"] == "completed":
        raise HTTPException(status_code=400, detail="Project is already completed")

    # Verify all milestones are completed
    milestones_resp = supabase.table("milestones").select("status").eq("project_id", project_id).execute()

    if milestones_resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch milestones")

    milestones = milestones_resp.data

    # Check if there are any milestones
    if len(milestones) == 0:
        raise HTTPException(status_code=400, detail="Project has no milestones to complete")

    # Check if all milestones are completed
    incomplete_milestones = [m for m in milestones if m["status"] != "completed"]

    if incomplete_milestones:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot complete project: {len(incomplete_milestones)} milestone(s) are not yet completed"
        )

    # All milestones are completed, update project status
    update_resp = supabase.table("projects").update({
        "status": "completed"
    }).eq("id", project_id).execute()

    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update project status")

    return {
        "message": "Project completed successfully",
        "project_id": project_id,
        "status": "completed"
    }
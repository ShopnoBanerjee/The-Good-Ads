from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.projects import Project, ProjectCreate, ProjectUpdate, ProjectApplication
from app.crud.crud_projects import (
    get_project,
    get_projects,
    create_project,
    update_project,
    delete_project,
)
from app.models.project import ProjectApplication as ProjectApplicationModel
from app.core.deps import get_db, get_current_user, require_user_type
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Project])
async def read_projects(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user_type("society")),
):
    return await get_projects(db=db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = await get_project(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.business_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="You do not have access to this project")
    return db_project

@router.post("/", response_model=Project)
async def create_new_project(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user_type("business")),
):

    if project.deadline and project.deadline.tzinfo is not None:
        project.deadline = project.deadline.replace(tzinfo=None)
        
    return await create_project(db=db, project=project)

@router.put("/{project_id}", response_model=Project)
async def update_existing_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = await get_project(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.business_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="You can only update your own projects")
    return await update_project(db=db, db_project=db_project, project_update=project_update)

@router.delete("/{project_id}", response_model=Project)
async def delete_existing_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = await get_project(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.business_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only project owners or admins can delete projects")
    return await delete_project(db=db, db_project=db_project)

@router.post("/{project_id}/interest", response_model=ProjectApplication)
async def express_interest(
    project_id: int,
    society_id: int, # Removed as current_user.id is used
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user_type("society")),
):
    db_project = await get_project(db=db, project_id=project_id)
    if not db_project or db_project.assigned:
        raise HTTPException(status_code=400, detail="Project not available for interest")
    
    # Use the SQLAlchemy model (ProjectApplicationModel) for DB operations
    db_project_application = ProjectApplicationModel(
        project_id=project_id, society_id=society_id
    )
    db.add(db_project_application)
    await db.commit()
    await db.refresh(db_project_application)
    return db_project_application # FastAPI will convert this to the Pydantic response_model

@router.post("/{project_id}/assign", response_model=Project)
async def assign_project(
    project_id: int,
    society_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user_type("business")),
):
    db_project = await get_project(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.assigned:
        raise HTTPException(status_code=400, detail="Project already assigned")
    if db_project.business_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only assign projects for your own business")
    db_project.assigned = True
    db_project.assigned_society_id = society_id
    await db.commit()
    await db.refresh(db_project)
    return db_project

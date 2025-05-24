from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.project import Project
from app.schemas.projects import ProjectCreate, ProjectUpdate

async def get_project(db: AsyncSession, project_id: int):
    result = await db.execute(select(Project).filter(Project.id == project_id))
    return result.scalars().first()

async def get_projects(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(select(Project).offset(skip).limit(limit))
    return result.scalars().all()

async def create_project(db: AsyncSession, project: ProjectCreate):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

async def update_project(db: AsyncSession, db_project: Project, project_update: ProjectUpdate):
    for key, value in project_update.dict(exclude_unset=True).items():
        setattr(db_project, key, value)
    await db.commit()
    await db.refresh(db_project)
    return db_project

async def delete_project(db: AsyncSession, db_project: Project):
    await db.delete(db_project)
    await db.commit()
    return db_project

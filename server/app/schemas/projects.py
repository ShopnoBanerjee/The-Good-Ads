from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    compensation: float
    status: Optional[str] = "open"
    deadline: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    business_id: int

class ProjectUpdate(ProjectBase):
    assigned: Optional[bool] = None
    assigned_society_id: Optional[int] = None
    completed_at: Optional[datetime] = None

class ProjectInDBBase(ProjectBase):
    id: int
    business_id: int
    assigned: bool
    assigned_society_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    pass

class ProjectInDB(ProjectInDBBase):
    pass

class ProjectApplicationBase(BaseModel):
    project_id: int
    society_id: int
    status: Optional[str] = "pending"
    budget_proposal: Optional[float] = None
    estimated_completion_time: Optional[int] = None

class ProjectApplicationCreate(ProjectApplicationBase):
    pass

class ProjectApplicationUpdate(ProjectApplicationBase):
    status: Optional[str] = None

class ProjectApplicationInDBBase(ProjectApplicationBase):
    id: int

    class Config:
        from_attributes = True

class ProjectApplication(ProjectApplicationInDBBase):
    pass

class ProjectApplicationInDB(ProjectApplicationInDBBase):
    pass
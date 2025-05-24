from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.business import Business, BusinessCreate, BusinessUpdate
from app.crud.crud_business import (
    get_business,
    get_businesses,
    create_business,
    update_business,
    delete_business,
)
from app.core.deps import get_db, get_current_user, require_user_type
from app.models import user as UserModel

router = APIRouter()

@router.get("/", response_model=List[Business])
async def read_businesses(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel.User = Depends(get_current_user),
):
    return await get_businesses(db=db, skip=skip, limit=limit)

@router.get("/{business_id}", response_model=Business)
async def read_business(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel.User = Depends(get_current_user),
):
    db_business = await get_business(db=db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    return db_business

@router.post("/", response_model=Business)
async def create_new_business(
    business: BusinessCreate,
    owner_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel.User = Depends(require_user_type("business")),
):
    return await create_business(db=db, business=business, owner_id=owner_id)

@router.put("/{business_id}", response_model=Business)
async def update_existing_business(
    business_id: int,
    business_update: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel.User = Depends(get_current_user),
):
    db_business = await get_business(db=db, business_id=business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    if db_business.owner_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="You can only update your own business")
    return await update_business(db=db, db_business=db_business, business_update=business_update)

@router.delete("/{business_id}", response_model=Business)
async def delete_existing_business(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel.User = Depends(get_current_user),
):
    owner_id = current_user.id
    db_business = await get_business(db=db, owner_id=owner_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    if db_business.owner_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only business owners or admins can delete businesses")
    return await delete_business(db=db, db_business=db_business)

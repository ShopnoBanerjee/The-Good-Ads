"""
Portfolio API routes for college societies.

Routes:
- POST /api/society/upload-portfolio
    Upload a portfolio item (image, video, pdf, ppt) for a college society.
    Requires JWT authentication and 'college_society' user type.
    Accepts: title, description, file (multipart/form-data).
    Stores file in Supabase Storage and metadata in 'society_portfolio_projects'.

- POST /api/upload-portfolio-metadata
    Upload metadata for a portfolio item.
    Requires JWT authentication and 'college_society' user type.
    Accepts: file_path, caption (JSON body).
    Stores metadata in 'portfolio_items'.

- GET /api/get-portfolio
    Retrieve all portfolio items for the authenticated college society.
    Requires JWT authentication and 'college_society' user type.
    Returns: List of portfolio items from 'portfolio_items'.

- POST /api/society/update-logo
    Update the logo for the authenticated college society.
    Requires JWT authentication and 'college_society' user type.
    Accepts: file (multipart/form-data).
    Stores logo in Supabase Storage and updates 'profiles' table with logo URL.
"""

from fastapi import APIRouter, UploadFile, Form, Header, HTTPException, Request
from supabase import create_client
from app.core.config import settings
from app.core.security import verify_jwt
import uuid

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.post("/api/society/upload-portfolio")
async def upload_portfolio_item(
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile = Form(...),
    authorization: str = Header(...)
):
    # ✅ Verify JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Must be a college_society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can upload")

    # ✅ Upload file to Supabase Storage
    contents = await file.read()
    bucket_name = "society-portfolio"
    unique_name = f"{uuid.uuid4()}_{file.filename}"

    upload_response = supabase.storage.from_(bucket_name).upload(unique_name, contents)

    if upload_response.get("error"):
        raise HTTPException(status_code=500, detail="Upload failed")

    file_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{unique_name}"

    # ✅ Detect file type
    ext = file.filename.split(".")[-1].lower()
    if ext in ["jpg", "jpeg", "png", "gif"]:
        file_type = "image"
    elif ext in ["mp4", "mov"]:
        file_type = "video"
    elif ext == "pdf":
        file_type = "pdf"
    elif ext == "ppt" or ext == "pptx":
        file_type = "ppt"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # ✅ Insert record
    resp = supabase.table("society_portfolio_projects").insert({
        "society_id": user_id,
        "title": title,
        "description": description,
        "file_url": file_url,
        "file_type": file_type
    }).execute()

    if not resp.data:
        raise HTTPException(status_code=500, detail="Insert failed")

    return {"message": "Portfolio item uploaded!", "file_url": file_url}

@router.post("/api/upload-portfolio-metadata")
async def upload_portfolio_metadata(request: Request, authorization: str = Header(...)):
    body = await request.json()
    file_path = body.get("file_path")
    caption = body.get("caption", "")

    if not file_path:
        raise HTTPException(status_code=400, detail="File path is required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Confirm user is a college_society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only college societies can upload")

    # Insert metadata
    insert = supabase.table("portfolio_items").insert({
        "society_id": user_id,
        "file_path": file_path,
        "caption": caption
    }).execute()

    if not insert.data:
        raise HTTPException(status_code=500, detail="Failed to insert portfolio metadata")

    return {"message": "Portfolio item saved", "id": insert.data[0]["id"]}

@router.get("/api/get-portfolio")
async def get_portfolio(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm the user is a college society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies have portfolios")

    try:
        # ✅ FIXED: correct table name and error handling
        resp = supabase.table("portfolio_items").select("*").eq("society_id", user_id).execute()
        # The data is directly in resp.data if the query is successful
        return resp.data
    except Exception as e:
        # Catch any potential exceptions during the Supabase query
        raise HTTPException(status_code=500, detail=f"Failed to retrieve portfolio: {str(e)}")


@router.post("/api/society/update-logo")
async def update_logo(
    file: UploadFile = Form(...),
    authorization: str = Header(...)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # ✅ Confirm college_society
    profile = supabase.table("profiles").select("user_type").eq("id", user_id).single().execute()
    if not profile.data or profile.data["user_type"] != "college_society":
        raise HTTPException(status_code=403, detail="Only societies can update logo")

    contents = await file.read()
    bucket_name = "society-portfolio"
    unique_name = f"logos/{user_id}/logo.png"

    try:
        supabase.storage.from_(bucket_name).upload(unique_name, contents, {"upsert": "true"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{unique_name}"

    # Update logo_url in both profiles and college_society_profiles tables
    update_profiles = supabase.table("profiles").update({"logo_url": public_url}).eq("id", user_id).execute()
    update_society_profiles = supabase.table("college_society_profiles").update({"logo_url": public_url}).eq("id", user_id).execute()

    if not update_profiles.data or not update_society_profiles.data:
        raise HTTPException(status_code=500, detail="Failed to update logo in one or both tables")

    return {"message": "Logo updated", "logo_url": public_url}


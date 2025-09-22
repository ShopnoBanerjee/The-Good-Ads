from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Form
from fastapi.responses import JSONResponse
import uuid
from datetime import datetime
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client
import os
from app.api.chat import manager

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def verify_conversation_access(conversation_id: str, user_id: str):
    """Verify user has access to the conversation"""
    try:
        conversation = supabase.table("conversations").select("*").eq("id", conversation_id).single().execute()
        if not conversation.data:
            return False
        return user_id in [conversation.data["business_id"], conversation.data["society_id"]]
    except:
        return False

@router.post("/api/chat/upload-attachment")
async def upload_attachment(
    file: UploadFile = File(...),
    conversation_id: str = Form(...),
    authorization: str = Header(...)
):
    """Upload file attachment for chat messages"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify access to conversation
    if not await verify_conversation_access(conversation_id, user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Validate file type
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    try:
        # Upload to Supabase Storage
        bucket_name = "chat-attachments"

        # Ensure bucket exists (this might need to be done manually in Supabase dashboard)
        # For now, we'll assume the bucket is created

        upload_response = supabase.storage.from_(bucket_name).upload(unique_filename, file_content)

        # Get public URL
        file_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{unique_filename}"

        return {
            "file_url": file_url,
            "file_name": file.filename,
            "file_type": file.content_type,
            "file_size": len(file_content)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/api/chat/send-file-message")
async def send_file_message(
    file_url: str = Form(...),
    file_name: str = Form(...),
    file_type: str = Form(...),
    file_size: int = Form(...),
    conversation_id: str = Form(...),
    authorization: str = Header(...)
):
    """Send a file message after upload"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify access
    if not await verify_conversation_access(conversation_id, user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Create message
    message_data = {
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "content": f"File: {file_name}",
        "message_type": "file"
    }

    message_response = supabase.table("messages").insert(message_data).execute()

    if not message_response.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    message = message_response.data[0]

    # Create attachment record
    attachment_data = {
        "message_id": message["id"],
        "file_url": file_url,
        "file_name": file_name,
        "file_type": file_type,
        "file_size": file_size
    }

    attachment_response = supabase.table("message_attachments").insert(attachment_data).execute()

    if not attachment_response.data:
        # Clean up message if attachment fails
        supabase.table("messages").delete().eq("id", message["id"]).execute()
        raise HTTPException(status_code=500, detail="Failed to save attachment")

    # Add attachment to message for broadcast
    message["message_attachments"] = [attachment_response.data[0]]

    # Broadcast the message
    await manager.broadcast_to_conversation(conversation_id, {"type": "new_message", "message": message})

    return {
        "message": message,
        "attachment": attachment_response.data[0]
    }

@router.delete("/api/chat/attachments/{attachment_id}")
async def delete_attachment(
    attachment_id: str,
    authorization: str = Header(...)
):
    """Delete a file attachment"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Get attachment and verify ownership
    attachment = supabase.table("message_attachments").select("""
        *,
        messages!inner(conversation_id, sender_id)
    """).eq("id", attachment_id).single().execute()

    if not attachment.data:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Verify user owns the message
    if attachment.data["messages"]["sender_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Delete from storage
    file_url = attachment.data["file_url"]
    # Extract filename from URL (this might need adjustment based on Supabase URL structure)
    filename = file_url.split("/")[-1]

    try:
        supabase.storage.from_("chat-attachments").remove([filename])
    except:
        pass  # Continue even if storage deletion fails

    # Delete from database
    supabase.table("message_attachments").delete().eq("id", attachment_id).execute()

    return {"message": "Attachment deleted"}

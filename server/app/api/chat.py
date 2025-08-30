from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Header
from typing import List, Dict
import json
from datetime import datetime
from app.core.config import settings
from app.core.security import verify_jwt
from supabase import create_client

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # conversation_id -> list of websockets

    async def connect(self, websocket: WebSocket, conversation_id: str, user_id: str):
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)
        # Store user_id in websocket state for later use
        websocket.state.user_id = user_id

    def disconnect(self, websocket: WebSocket, conversation_id: str):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast_to_conversation(self, conversation_id: str, message: dict, exclude_websocket: WebSocket = None):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_json(message)
                    except:
                        # Remove dead connections
                        self.active_connections[conversation_id].remove(connection)

manager = ConnectionManager()

async def get_current_user_ws(authorization: str = Header(...)):
    """Dependency to authenticate WebSocket connections"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)
    return user_id

async def verify_conversation_access(conversation_id: str, user_id: str):
    """Verify user has access to the conversation"""
    try:
        conversation = supabase.table("conversations").select("*").eq("id", conversation_id).single().execute()
        if not conversation.data:
            return False
        return user_id in [conversation.data["business_id"], conversation.data["society_id"]]
    except:
        return False

@router.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: str,
):
    """WebSocket endpoint: perform the HTTP handshake first, then
    authenticate the user by expecting an initial auth message over the
    socket (type: "auth", token: <jwt>). Do NOT use a Header dependency
    because FastAPI will try to extract it during the HTTP handshake and
    reject the connection with 403 if the header isn't present.
    """
    user_id = None
    token = None

    # Accept the websocket handshake first so we can communicate over it
    await websocket.accept()

    # Receive auth message over the opened websocket
    try:
        auth_data = await websocket.receive_json()
    except:
        await websocket.close(code=1008)
        return

    if auth_data.get("type") != "auth":
        await websocket.close(code=1008)
        return

    token = auth_data.get("token")
    try:
        user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)
    except Exception:
        await websocket.close(code=1008)
        return

    # Verify access to conversation
    if not await verify_conversation_access(conversation_id, user_id):
        await websocket.close(code=1008)
        return

    # Register connection
    await manager.connect(websocket, conversation_id, user_id)

    try:
        while True:
            data = await websocket.receive_json()

            # Handle different message types
            if data.get("type") == "message":
                # Save message to database
                message_data = {
                    "conversation_id": conversation_id,
                    "sender_id": user_id,
                    "content": data["content"],
                    "message_type": data.get("message_type", "text")
                }

                message_response = supabase.table("messages").insert(message_data).execute()

                if message_response.data:
                    message = message_response.data[0]

                    # Broadcast to all users in conversation
                    broadcast_data = {
                        "type": "new_message",
                        "message": {
                            "id": message["id"],
                            "conversation_id": message["conversation_id"],
                            "sender_id": message["sender_id"],
                            "content": message["content"],
                            "message_type": message["message_type"],
                            "created_at": message["created_at"],
                            "is_read": False
                        }
                    }

                    await manager.broadcast_to_conversation(conversation_id, broadcast_data)

            elif data.get("type") == "typing":
                # Broadcast typing indicator
                typing_data = {
                    "type": "typing",
                    "user_id": user_id,
                    "is_typing": data.get("is_typing", False)
                }
                await manager.broadcast_to_conversation(conversation_id, typing_data, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
        # Broadcast user left
        left_data = {
            "type": "user_left",
            "user_id": user_id
        }
        await manager.broadcast_to_conversation(conversation_id, left_data)

@router.post("/api/chat/conversations")
async def create_conversation(request: dict, authorization: str = Header(...)):
    """Create a new conversation when proposal is accepted"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    project_id = request.get("project_id")
    business_id = request.get("business_id")
    society_id = request.get("society_id")

    if not all([project_id, business_id, society_id]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Verify user is part of the conversation
    if user_id not in [business_id, society_id]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Check if conversation already exists
    existing = supabase.table("conversations").select("*").eq("project_id", project_id).execute()
    if existing.data:
        return {"conversation_id": existing.data[0]["id"]}

    # Create new conversation
    conversation_data = {
        "project_id": project_id,
        "business_id": business_id,
        "society_id": society_id
    }

    response = supabase.table("conversations").insert(conversation_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")

    return {"conversation_id": response.data[0]["id"]}

@router.get("/api/chat/conversations")
async def get_user_conversations(authorization: str = Header(...)):
    """Get all conversations for the current user"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Get conversations where user is business or society
    conversations = supabase.table("conversations").select("""
        *,
        projects!inner(compliant_name, compliant_description)
    """).or_(f"business_id.eq.{user_id},society_id.eq.{user_id}").execute()

    return conversations.data

@router.get("/api/chat/messages/{conversation_id}")
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    authorization: str = Header(...)
):
    """Get messages for a conversation with pagination"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    # Verify access
    if not await verify_conversation_access(conversation_id, user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Get messages
    messages = supabase.table("messages").select("""
        *,
        message_attachments(*)
    """).eq("conversation_id", conversation_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    return messages.data

@router.post("/api/chat/messages")
async def send_message(request: dict, authorization: str = Header(...)):
    """Send a message (alternative to WebSocket for file uploads)"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    user_id = verify_jwt(token, settings.SUPABASE_JWT_SECRET)

    conversation_id = request.get("conversation_id")
    content = request.get("content")
    message_type = request.get("message_type", "text")

    if not all([conversation_id, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Verify access
    if not await verify_conversation_access(conversation_id, user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Save message
    message_data = {
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "content": content,
        "message_type": message_type
    }

    response = supabase.table("messages").insert(message_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    message = response.data[0]

    # Broadcast via WebSocket if connections exist
    broadcast_data = {
        "type": "new_message",
        "message": message
    }
    await manager.broadcast_to_conversation(conversation_id, broadcast_data)

    return message

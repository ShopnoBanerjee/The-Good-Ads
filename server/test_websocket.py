import asyncio
import json
import websockets

async def test_websocket():
    uri = "ws://127.0.0.1:8000/ws/chat/test_conversation_id"
    try:
        async with websockets.connect(uri) as websocket:
            print("WebSocket connected successfully.")
            # Send dummy auth message
            auth_message = {"type": "auth", "token": "dummy_jwt_token"}
            await websocket.send(json.dumps(auth_message))
            print("Auth message sent.")
            # Try to receive response (should fail due to invalid token, but no RuntimeError)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print("Received response:", response)
            except asyncio.TimeoutError:
                print("No response received (expected due to invalid token).")
            except Exception as e:
                print("Error receiving:", e)
    except Exception as e:
        print("Connection failed:", e)

if __name__ == "__main__":
    asyncio.run(test_websocket())

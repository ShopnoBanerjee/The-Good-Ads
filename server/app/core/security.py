import jwt
from fastapi import HTTPException, status

def verify_jwt(token: str, secret: str):
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        return decoded["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

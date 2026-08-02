from fastapi import APIRouter, HTTPException
from models.user import UserCreate, UserLogin
from services.auth_service import create_user, login_user


router = APIRouter()


@router.post("/signup")
async def signup(data: UserCreate):

    user = await create_user(data)

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return {
        "message": "User created successfully",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"]
        }
    }



@router.post("/login")
async def login(data: UserLogin):

    token = await login_user(data)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return token
from database.mongodb import user_collection
from models.user import UserCreate, UserLogin
from utils.security import (
    hash_password,
    verify_password,
    create_access_token
)
from datetime import datetime, timezone


async def create_user(data: UserCreate):

    existing_user = await user_collection.find_one(
        {"email": data.email}
    )

    if existing_user:
        return None


    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }


    result = await user_collection.insert_one(user)

    user["user_id"] = str(result.inserted_id)

    return user



async def login_user(data: UserLogin):

    user = await user_collection.find_one(
        {"email": data.email}
    )


    if not user:
        return None


    password_match = verify_password(
        data.password,
        user["password"]
    )


    if not password_match:
        return None


    token = create_access_token(
        {
            "sub": str(user["_id"]),
            "email": user["email"]
        }
    )


    return {
        "access_token": token,
        "token_type": "bearer"
    }
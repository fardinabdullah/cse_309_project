from database.mongodb import workspace_collection
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status


# CREATE WORKSPACE
async def create_workspace(data, current_user):
    
    # ✅ CHECK FOR DUPLICATE NAME FOR THIS USER
    existing = await workspace_collection.find_one({
        "name": data.name,
        "owner_id": current_user["user_id"]
    })
    
    if existing:
        print(f"⚠️ DUPLICATE FOUND: {data.name} for user {current_user['user_id']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a workspace named '{data.name}'. Please choose a different name."
        )
    
    workspace = {
        "name": data.name,
        "description": data.description,
        "owner_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await workspace_collection.insert_one(workspace)
    workspace["_id"] = str(result.inserted_id)
    
    return workspace


# GET ALL WORKSPACES OF CURRENT USER ONLY
async def get_workspaces(current_user):
    workspaces = []
    cursor = workspace_collection.find({
        "owner_id": current_user["user_id"]
    })
    
    async for workspace in cursor:
        workspace["_id"] = str(workspace["_id"])
        workspaces.append(workspace)
    
    return workspaces


# GET ONE WORKSPACE OF CURRENT USER ONLY
async def get_workspace(workspace_id, current_user):
    try:
        workspace = await workspace_collection.find_one({
            "_id": ObjectId(workspace_id),
            "owner_id": current_user["user_id"]
        })
        
        if workspace:
            workspace["_id"] = str(workspace["_id"])
        
        return workspace
    except:
        return None


# UPDATE WORKSPACE
async def update_workspace(workspace_id, data, current_user):
    
    # ✅ CHECK FOR DUPLICATE NAME (EXCLUDING CURRENT WORKSPACE)
    existing = await workspace_collection.find_one({
        "name": data.name,
        "owner_id": current_user["user_id"],
        "_id": {"$ne": ObjectId(workspace_id)}
    })
    
    if existing:
        print(f"⚠️ DUPLICATE ON UPDATE: {data.name} for user {current_user['user_id']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have another workspace named '{data.name}'. Please choose a different name."
        )
    
    updated = {
        "name": data.name,
        "description": data.description
    }
    
    result = await workspace_collection.update_one(
        {
            "_id": ObjectId(workspace_id),
            "owner_id": current_user["user_id"]
        },
        {
            "$set": updated
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return await get_workspace(workspace_id, current_user)


# DELETE WORKSPACE
async def delete_workspace(workspace_id, current_user):
    result = await workspace_collection.delete_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return {
        "message": "Workspace deleted successfully",
        "deleted": True
    }
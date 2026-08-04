from database.mongodb import workspace_collection
from datetime import datetime, timezone
from bson import ObjectId



# CREATE WORKSPACE
async def create_workspace(data, current_user):

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


    cursor = workspace_collection.find(
        {
            "owner_id": current_user["user_id"]
        }
    )


    async for workspace in cursor:

        workspace["_id"] = str(workspace["_id"])

        workspaces.append(workspace)


    return workspaces





# GET ONE WORKSPACE OF CURRENT USER ONLY
async def get_workspace(workspace_id, current_user):

    workspace = await workspace_collection.find_one(
        {
            "_id": ObjectId(workspace_id),

            "owner_id": current_user["user_id"]
        }
    )


    if workspace:

        workspace["_id"] = str(workspace["_id"])


    return workspace





# UPDATE WORKSPACE
async def update_workspace(workspace_id, data, current_user):

    updated = {

        "name": data.name,

        "description": data.description

    }


    await workspace_collection.update_one(

        {
            "_id": ObjectId(workspace_id),

            "owner_id": current_user["user_id"]
        },

        {
            "$set": updated
        }

    )


    return await get_workspace(
        workspace_id,
        current_user
    )





# DELETE WORKSPACE
async def delete_workspace(workspace_id, current_user):

    result = await workspace_collection.delete_one(

        {
            "_id": ObjectId(workspace_id),

            "owner_id": current_user["user_id"]
        }

    )


    return {

        "deleted": result.deleted_count > 0

    }
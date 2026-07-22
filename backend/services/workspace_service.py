from database.mongodb import workspace_collection
from datetime import datetime
from bson import ObjectId


async def create_workspace(data):

    workspace = {
        "name": data.name,
        "description": data.description,
        "owner_id": data.owner_id,
        "created_at": datetime.utcnow().isoformat()
    }

    result = await workspace_collection.insert_one(workspace)

    workspace["_id"] = str(result.inserted_id)

    return workspace


async def get_workspaces():

    workspaces = []

    cursor = workspace_collection.find()

    async for workspace in cursor:
        workspace["_id"] = str(workspace["_id"])
        workspaces.append(workspace)

    return workspaces


async def update_workspace(workspace_id, data):

    await workspace_collection.update_one(
        {
            "_id": ObjectId(workspace_id)
        },
        {
            "$set": {
                "name": data.name,
                "description": data.description
            }
        }
    )

    return {
        "message": "Workspace updated successfully"
    }


async def delete_workspace(workspace_id):

    await workspace_collection.delete_one(
        {
            "_id": ObjectId(workspace_id)
        }
    )

    return {
        "message": "Workspace deleted successfully"
    }


async def get_workspace(workspace_id):

    workspace = await workspace_collection.find_one(
        {
            "_id": ObjectId(workspace_id)
        }
    )

    if workspace:
        workspace["_id"] = str(workspace["_id"])

    return workspace
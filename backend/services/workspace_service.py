from database.dynamodb import get_table
import uuid
from datetime import datetime


TABLE_NAME = "Workspaces"


def create_workspace(data):
    table = get_table(TABLE_NAME)

    workspace = {
        "workspace_id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "owner_id": data.owner_id,
        "created_at": datetime.utcnow().isoformat()
    }

    table.put_item(Item=workspace)

    return workspace


def get_workspaces():
    table = get_table(TABLE_NAME)

    response = table.scan()

    return response.get("Items", [])


def update_workspace(workspace_id, data):
    table = get_table(TABLE_NAME)

    response = table.update_item(
        Key={
            "workspace_id": workspace_id
        },
        UpdateExpression="SET #name=:name, description=:description",
        ExpressionAttributeNames={
            "#name": "name"
        },
        ExpressionAttributeValues={
            ":name": data.name,
            ":description": data.description
        },
        ReturnValues="ALL_NEW"
    )

    return response["Attributes"]


def delete_workspace(workspace_id):
    table = get_table(TABLE_NAME)

    table.delete_item(
        Key={
            "workspace_id": workspace_id
        }
    )

    return {
        "message": "Workspace deleted successfully"
    }
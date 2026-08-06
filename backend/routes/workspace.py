from fastapi import APIRouter
from models.workspace import Workspace

from services.workspace_service import (
    create_workspace,
    get_workspaces,
    get_workspace,
    update_workspace,
    delete_workspace
)


router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"]
)


@router.post("/")
async def create(data: Workspace):     # fastapi automatically creates the parameter data
    return await create_workspace(data)


@router.get("/")
async def read_all():
    return await get_workspaces()


@router.get("/{workspace_id}")
async def read_one(workspace_id: str):
    return await get_workspace(workspace_id)


@router.put("/{workspace_id}")
async def update(workspace_id: str, data: Workspace):
    return await update_workspace(workspace_id, data)


@router.delete("/{workspace_id}")
async def delete(workspace_id: str):
    return await delete_workspace(workspace_id)
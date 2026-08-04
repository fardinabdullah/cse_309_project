from fastapi import APIRouter, Depends

from models.workspace import Workspace

from services.workspace_service import (
    create_workspace,
    get_workspaces,
    get_workspace,
    update_workspace,
    delete_workspace
)

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"]
)



@router.post("/")
async def create(
    data: Workspace,
    current_user = Depends(get_current_user)
):

    return await create_workspace(
        data,
        current_user
    )



@router.get("/")
async def read_all(
    current_user = Depends(get_current_user)
):

    return await get_workspaces(
        current_user
    )



@router.get("/{workspace_id}")
async def read_one(
    workspace_id: str,
    current_user = Depends(get_current_user)
):

    return await get_workspace(
        workspace_id,
        current_user
    )



@router.put("/{workspace_id}")
async def update(
    workspace_id: str,
    data: Workspace,
    current_user = Depends(get_current_user)
):

    return await update_workspace(
        workspace_id,
        data,
        current_user
    )



@router.delete("/{workspace_id}")
async def delete(
    workspace_id: str,
    current_user = Depends(get_current_user)
):

    return await delete_workspace(
        workspace_id,
        current_user
    )
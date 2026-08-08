from fastapi import APIRouter, Depends, HTTPException, status

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
<<<<<<< HEAD
async def create(data: Workspace):     # fastapi automatically creates the parameter data
    return await create_workspace(data)
=======
async def create(
    data: Workspace,
    current_user = Depends(get_current_user)
):
    try:
        return await create_workspace(data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CREATE ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
>>>>>>> #7-user-dashboard


@router.get("/")
async def read_all(
    current_user = Depends(get_current_user)
):
    return await get_workspaces(current_user)


@router.get("/{workspace_id}")
async def read_one(
    workspace_id: str,
    current_user = Depends(get_current_user)
):
    return await get_workspace(workspace_id, current_user)


@router.put("/{workspace_id}")
async def update(
    workspace_id: str,
    data: Workspace,
    current_user = Depends(get_current_user)
):
    try:
        return await update_workspace(workspace_id, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ UPDATE ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{workspace_id}")
async def delete(
    workspace_id: str,
    current_user = Depends(get_current_user)
):
    try:
        return await delete_workspace(workspace_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ DELETE ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
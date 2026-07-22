from fastapi import APIRouter
from models.workspace import Workspace
from services.workspace_service import (
    create_workspace,
    get_workspaces,
    update_workspace,
    delete_workspace
)


router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"]
)


@router.post("/")
def create(data: Workspace):
    return create_workspace(data)


@router.get("/")
def read_all():
    return get_workspaces()


@router.put("/{workspace_id}")
def update(workspace_id: str, data: Workspace):
    return update_workspace(workspace_id, data)


@router.delete("/{workspace_id}")
def delete(workspace_id: str):
    return delete_workspace(workspace_id)
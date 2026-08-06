from pydantic import BaseModel
from typing import Optional


class Workspace(BaseModel):
    workspace_id: Optional[str] = None
    name: str
    description: str
    owner_id: Optional[str] = None
    created_at: Optional[str] = None


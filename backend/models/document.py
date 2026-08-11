from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentVersion(BaseModel):
    version: int
    file_path: str
    file_size: int
    uploaded_at: str
    uploaded_by: str
    comment: Optional[str] = None


class Document(BaseModel):
    document_id: Optional[str] = None
    workspace_id: str
    name: str
    description: Optional[str] = None
    file_type: str  # pdf, docx, xlsx, pptx, image, txt
    file_id: str
    filename: str
    file_path: str
    file_size: int
    versions: List[DocumentVersion] = []
    current_version: int = 1
    uploaded_at: str
    uploaded_by: str
    tags: List[str] = []
    comments: List[dict] = []  # {user: str, text: str, timestamp: str}


class DocumentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
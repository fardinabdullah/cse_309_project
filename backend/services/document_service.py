import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import UploadFile

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_file_type(filename: str) -> str:
    """Detect file type from extension (no external dependencies)"""
    ext = filename.split('.')[-1].lower()
    
    file_types = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'xls': 'excel',
        'xlsx': 'excel',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'bmp': 'image',
        'webp': 'image',
        'txt': 'text',
        'md': 'text',
        'csv': 'excel',
        'json': 'text',
        'xml': 'text',
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
    }
    return file_types.get(ext, 'other')


def save_document(file: UploadFile, workspace_id: str) -> Dict[str, Any]:
    """Save uploaded document to disk"""
    file_id = str(uuid.uuid4())
    
    # Create workspace folder
    workspace_folder = os.path.join(UPLOAD_DIR, workspace_id)
    os.makedirs(workspace_folder, exist_ok=True)
    
    file_path = os.path.join(workspace_folder, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)
    
    file_size = os.path.getsize(file_path)
    file_type = get_file_type(file.filename)
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_type,
    }


def create_document_version(file_path: str, file_size: int, uploaded_by: str, comment: str = "") -> Dict:
    """Create a new document version"""
    return {
        "version": 1,
        "file_path": file_path,
        "file_size": file_size,
        "uploaded_at": datetime.now().isoformat(),
        "uploaded_by": uploaded_by,
        "comment": comment
    }


def get_document_stats(documents: List[Dict]) -> Dict[str, Any]:
    """Calculate document statistics"""
    total = len(documents)
    by_type = {}
    total_size = 0
    
    for doc in documents:
        file_type = doc.get("file_type", "other")
        by_type[file_type] = by_type.get(file_type, 0) + 1
        total_size += doc.get("file_size", 0)
    
    return {
        "total_documents": total,
        "by_type": by_type,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "versions_count": sum(len(doc.get("versions", [])) for doc in documents)
    }


def get_document_versions(documents: List[Dict]) -> List[Dict]:
    """Get all document versions"""
    all_versions = []
    for doc in documents:
        for version in doc.get("versions", []):
            all_versions.append({
                "document_name": doc.get("name", "Untitled"),
                "version": version
            })
    return all_versions
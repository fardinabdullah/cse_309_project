from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List
from bson import ObjectId
from datetime import datetime
import os

from services.document_service import (
    save_document,
    create_document_version,
    get_document_stats,
    get_document_versions
)
from database.mongodb import workspace_collection
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    name: str = Form(None),
    description: str = Form(""),
    current_user = Depends(get_current_user)
):
    """Upload a single document"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Save file
    file_data = save_document(file, workspace_id)
    
    # Create document
    doc_name = name or file.filename
    document = {
        "name": doc_name,
        "description": description,
        "file_type": file_data["file_type"],
        "file_id": file_data["file_id"],
        "filename": file_data["filename"],
        "file_path": file_data["file_path"],
        "file_size": file_data["file_size"],
        "current_version": 1,
        "versions": [{
            "version": 1,
            "file_path": file_data["file_path"],
            "file_size": file_data["file_size"],
            "uploaded_at": datetime.now().isoformat(),
            "uploaded_by": current_user["user_id"],
            "comment": ""
        }],
        "uploaded_at": datetime.now().isoformat(),
        "uploaded_by": current_user["user_id"],
        "tags": [],
        "comments": []
    }
    
    await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id)},
        {"$push": {"documents": document}}
    )
    
    return {"message": "Document uploaded successfully", "document": document}


@router.post("/upload/bulk")
async def bulk_upload_documents(
    files: List[UploadFile] = File(...),
    workspace_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    """Upload multiple documents"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    uploaded_docs = []
    
    for file in files:
        file_data = save_document(file, workspace_id)
        
        document = {
            "name": file.filename,
            "description": "",
            "file_type": file_data["file_type"],
            "file_id": file_data["file_id"],
            "filename": file_data["filename"],
            "file_path": file_data["file_path"],
            "file_size": file_data["file_size"],
            "current_version": 1,
            "versions": [{
                "version": 1,
                "file_path": file_data["file_path"],
                "file_size": file_data["file_size"],
                "uploaded_at": datetime.now().isoformat(),
                "uploaded_by": current_user["user_id"],
                "comment": ""
            }],
            "uploaded_at": datetime.now().isoformat(),
            "uploaded_by": current_user["user_id"],
            "tags": [],
            "comments": []
        }
        uploaded_docs.append(document)
    
    await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id)},
        {"$push": {"documents": {"$each": uploaded_docs}}}
    )
    
    return {"message": f"Uploaded {len(uploaded_docs)} documents", "documents": uploaded_docs}


@router.get("/{workspace_id}")
async def get_documents(
    workspace_id: str,
    current_user = Depends(get_current_user)
):
    """Get all documents in a workspace"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return workspace.get("documents", [])


@router.get("/view/{document_id}")
async def view_document(
    document_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    """View a document"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    documents = workspace.get("documents", [])
    document = None
    for doc in documents:
        if doc.get("file_id") == document_id or str(doc.get("_id")) == document_id:
            document = doc
            break
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = document.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=document.get("filename", "document")
    )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    """Delete a document"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    documents = workspace.get("documents", [])
    updated_docs = []
    file_path = None
    
    for doc in documents:
        if doc.get("file_id") == document_id or str(doc.get("_id")) == document_id:
            file_path = doc.get("file_path")
        else:
            updated_docs.append(doc)
    
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except:
            pass
    
    await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id)},
        {"$set": {"documents": updated_docs}}
    )
    
    return {"message": "Document deleted successfully"}


@router.get("/dashboard/{workspace_id}")
async def get_document_dashboard(
    workspace_id: str,
    current_user = Depends(get_current_user)
):
    """Get document statistics"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    documents = workspace.get("documents", [])
    stats = get_document_stats(documents)
    versions = get_document_versions(documents)
    
    return {
        "stats": stats,
        "recent_versions": versions[:5]
    }

@router.get("/view/{document_id}")
async def view_document(
    document_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    token: str = Query(None, description="Auth token"),
    current_user = Depends(get_current_user)
):
    """View a document"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    documents = workspace.get("documents", [])
    document = None
    for doc in documents:
        if doc.get("file_id") == document_id or str(doc.get("_id")) == document_id:
            document = doc
            break
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = document.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=document.get("filename", "document")
    )
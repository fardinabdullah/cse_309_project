from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from services.reading_service import (
    update_progress,
    get_progress,
    get_section_completion,
    search_in_paper
)
from database.mongodb import workspace_collection
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/reading", tags=["Reading"])


@router.post("/progress")
async def update_reading_progress(
    paper_id: str = Query(..., description="Paper ID"),
    workspace_id: str = Query(..., description="Workspace ID"),
    page: int = Query(..., description="Current page number"),
    current_user = Depends(get_current_user)
):
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    paper = None
    for p in papers:
        if str(p.get("_id")) == paper_id or p.get("file_id") == paper_id:
            paper = p
            break
    
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    total_pages = paper.get("pages", 0)
    progress_data = update_progress(paper_id, current_user["user_id"], page, total_pages)
    
    return {
        "message": "Progress updated",
        "progress": progress_data
    }


@router.get("/progress/{paper_id}")
async def get_reading_progress(
    paper_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    paper = None
    for p in papers:
        if str(p.get("_id")) == paper_id or p.get("file_id") == paper_id:
            paper = p
            break
    
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    total_pages = paper.get("pages", 0)
    sections = paper.get("sections", [])
    
    reading_data = {}
    progress = get_progress(paper_id, current_user["user_id"], reading_data)
    section_completion = get_section_completion(sections, progress.get("current_page", 0), total_pages)
    
    completed_sections = len([s for s in section_completion if s["is_completed"]])
    total_sections = len(section_completion)
    
    return {
        "paper": {
            "id": paper_id,
            "title": paper.get("title", "Unknown"),
            "authors": paper.get("authors", "Unknown"),
            "year": paper.get("year", "Unknown")
        },
        "progress": progress,
        "sections": section_completion,
        "summary": {
            "total_sections": total_sections,
            "completed_sections": completed_sections,
            "progress_percentage": round((completed_sections / total_sections) * 100, 1) if total_sections > 0 else 0
        }
    }


@router.get("/search/{paper_id}")
async def search_paper(
    paper_id: str,
    query: str = Query(..., description="Search query"),
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    paper = None
    for p in papers:
        if str(p.get("_id")) == paper_id or p.get("file_id") == paper_id:
            paper = p
            break
    
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    file_path = paper.get("file_path")
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    results = search_in_paper(file_path, query)
    
    return {
        "paper_title": paper.get("title", "Unknown"),
        "query": query,
        "total_results": len(results),
        "results": results
    }
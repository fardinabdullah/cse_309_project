from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List
import os
import uuid
from bson import ObjectId
from datetime import datetime

from services.paper_service import (
    extract_metadata_from_pdf,
    search_across_papers,
    calculate_dashboard_stats,
    find_solutions_for_difficult_topic
)
from database.mongodb import workspace_collection
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/papers", tags=["Papers"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================
# 1. UPLOAD PAPER
# ============================================

@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    metadata = extract_metadata_from_pdf(file_path)
    
    paper = {
        "file_id": file_id,
        "filename": file.filename,
        "file_path": file_path,
        "title": metadata.get("title", "Unknown"),
        "authors": metadata.get("authors", "Unknown"),
        "year": metadata.get("year", "Unknown"),
        "journal": metadata.get("journal", "Unknown"),
        "pages": metadata.get("pages", 0),
        "sections": metadata.get("sections", []),
        "uploaded_at": datetime.now().isoformat(),
        "uploaded_by": current_user["user_id"]
    }
    
    result = await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id), "owner_id": current_user["user_id"]},
        {"$push": {"papers": paper}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return {"message": "Paper uploaded successfully", "paper": paper}


# ============================================
# 2. BULK UPLOAD
# ============================================

@router.post("/upload/bulk")
async def bulk_upload_papers(
    files: List[UploadFile] = File(...),
    workspace_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    uploaded_papers = []
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            continue
        
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        metadata = extract_metadata_from_pdf(file_path)
        
        paper = {
            "file_id": file_id,
            "filename": file.filename,
            "file_path": file_path,
            "title": metadata.get("title", "Unknown"),
            "authors": metadata.get("authors", "Unknown"),
            "year": metadata.get("year", "Unknown"),
            "journal": metadata.get("journal", "Unknown"),
            "pages": metadata.get("pages", 0),
            "sections": metadata.get("sections", []),
            "uploaded_at": datetime.now().isoformat(),
            "uploaded_by": current_user["user_id"]
        }
        uploaded_papers.append(paper)
    
    await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id), "owner_id": current_user["user_id"]},
        {"$push": {"papers": {"$each": uploaded_papers}}}
    )
    
    return {"message": f"Uploaded {len(uploaded_papers)} papers", "papers": uploaded_papers}


# ============================================
# 3. IMPORT FROM DOI
# ============================================

@router.post("/import/doi")
async def import_from_doi(
    doi: str = Form(...),
    workspace_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.crossref.org/works/{doi}")
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="DOI not found")
            
            data = response.json()
            item = data.get("message", {})
            
            paper = {
                "file_id": None,
                "filename": f"{doi.replace('/', '_')}.pdf",
                "file_path": None,
                "title": item.get("title", ["Unknown"])[0] if item.get("title") else "Unknown",
                "authors": ", ".join([a.get("family", "") for a in item.get("author", [])[:5]]) if item.get("author") else "Unknown",
                "year": item.get("issued", {}).get("date-parts", [[None]])[0][0] or "Unknown",
                "journal": item.get("container-title", ["Unknown"])[0] if item.get("container-title") else "Unknown",
                "pages": 0,
                "sections": [],
                "doi": doi,
                "imported_at": datetime.now().isoformat(),
                "uploaded_by": current_user["user_id"]
            }
            
            await workspace_collection.update_one(
                {"_id": ObjectId(workspace_id), "owner_id": current_user["user_id"]},
                {"$push": {"papers": paper}}
            )
            
            return {"message": "Paper imported from DOI", "paper": paper}
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing DOI: {str(e)}")


# ============================================
# 4. SEARCH PAPERS
# ============================================

@router.get("/search")
async def search_papers(
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
    results = search_across_papers(papers, query)
    
    return {"query": query, "total_results": len(results), "results": results}


# ============================================
# 5. VIEW PDF
# ============================================

@router.get("/view/{paper_id}")
async def view_paper(
    paper_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    """Get PDF file for viewing in browser"""
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
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=paper.get("filename", "paper.pdf")
    )


# ============================================
# 6. DELETE PAPER
# ============================================

@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    """Delete a paper from the workspace"""
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    paper_to_delete = None
    updated_papers = []
    
    for p in papers:
        if str(p.get("_id")) == paper_id or p.get("file_id") == paper_id:
            paper_to_delete = p
        else:
            updated_papers.append(p)
    
    if not paper_to_delete:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    file_path = paper_to_delete.get("file_path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    await workspace_collection.update_one(
        {"_id": ObjectId(workspace_id)},
        {"$set": {"papers": updated_papers}}
    )
    
    return {
        "message": "Paper deleted successfully",
        "deleted": True
    }


# ============================================
# 7. PAPER DASHBOARD
# ============================================

@router.get("/dashboard/{workspace_id}")
async def get_dashboard(
    workspace_id: str,
    current_user = Depends(get_current_user)
):
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    stats = calculate_dashboard_stats(papers)
    
    return stats


# ============================================
# 8. DIFFICULTY ANALYSIS
# ============================================

@router.get("/difficulty/{paper_id}")
async def get_difficulty_analysis(
    paper_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    return {
        "sections": [
            {"name": "Introduction", "speed": 2.5, "is_difficult": False, "difficulty_level": "normal"},
            {"name": "Methods", "speed": 3.0, "is_difficult": False, "difficulty_level": "normal"},
            {"name": "Results", "speed": 6.5, "is_difficult": True, "difficulty_level": "hard"},
            {"name": "Discussion", "speed": 4.8, "is_difficult": True, "difficulty_level": "moderate"}
        ],
        "hard_sections": ["Results"],
        "recommendations": [
            {"topic": "Statistics", "reason": "Slow reading speed detected"}
        ]
    }


# ============================================
# 9. FIND SOLUTIONS
# ============================================

@router.get("/difficulty/solutions")
async def find_solutions(
    topic: str = Query(..., description="The topic to search for"),
    current_user = Depends(get_current_user)
):
    solutions = await find_solutions_for_difficult_topic(topic)
    return {"topic": topic, "solutions": solutions}
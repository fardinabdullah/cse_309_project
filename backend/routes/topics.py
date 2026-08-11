from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from services.topic_service import (
    add_topic_to_category,
    move_topic,
    get_all_topics_by_category,
    get_papers_for_topic,
    get_topic_summary
)
from database.mongodb import workspace_collection
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.post("/add")
async def add_topic(
    topic: str = Query(..., description="Topic name"),
    category: str = Query(..., description="hard, moderate, easy, or new"),
    paper_id: str = Query(..., description="Paper ID"),
    section: str = Query("", description="Section where topic was found"),
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user = Depends(get_current_user)
):
    if category not in ["hard", "moderate", "easy", "new"]:
        raise HTTPException(status_code=400, detail="Category must be hard, moderate, easy, or new")
    
    workspace = await workspace_collection.find_one({
        "_id": ObjectId(workspace_id),
        "owner_id": current_user["user_id"]
    })
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = workspace.get("papers", [])
    paper_title = "Unknown"
    for p in papers:
        if str(p.get("_id")) == paper_id or p.get("file_id") == paper_id:
            paper_title = p.get("title", "Unknown")
            break
    
    result = add_topic_to_category(
        current_user["user_id"],
        topic,
        category,
        paper_id,
        paper_title,
        section
    )
    
    return {
        "message": f"Topic '{topic}' added to {category} category",
        "topic": topic,
        "category": category,
        "papers": result["papers"]
    }


@router.post("/move")
async def move_topic_endpoint(
    topic: str = Query(..., description="Topic name"),
    from_category: str = Query(..., description="Current category"),
    to_category: str = Query(..., description="New category"),
    current_user = Depends(get_current_user)
):
    if from_category not in ["hard", "moderate", "easy"] or to_category not in ["hard", "moderate", "easy"]:
        raise HTTPException(status_code=400, detail="Category must be hard, moderate, or easy")
    
    success = move_topic(current_user["user_id"], topic, from_category, to_category)
    if not success:
        raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found in {from_category}")
    
    return {
        "message": f"Topic '{topic}' moved from {from_category} to {to_category}"
    }


@router.get("/all")
async def get_all_topics(current_user = Depends(get_current_user)):
    topics = get_all_topics_by_category(current_user["user_id"])
    return topics


@router.get("/{topic}")
async def get_topic_papers(
    topic: str,
    current_user = Depends(get_current_user)
):
    papers = get_papers_for_topic(current_user["user_id"], topic)
    return {"topic": topic, "papers": papers}


@router.get("/summary")
async def get_topic_summary_endpoint(current_user = Depends(get_current_user)):
    return get_topic_summary(current_user["user_id"])
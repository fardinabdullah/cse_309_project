from typing import Dict, List, Any
from datetime import datetime

user_topics = {}

def get_user_topics(user_id: str) -> Dict:
    """Get or create user's topic categories"""
    if user_id not in user_topics:
        user_topics[user_id] = {
            "hard": {},
            "moderate": {},
            "easy": {}
        }
    return user_topics[user_id]


def add_topic_to_category(user_id: str, topic: str, category: str, paper_id: str, paper_title: str, section: str = "") -> Dict:
    """Add a topic to a specific category with paper details"""
    # Allow 'new' category
    if category not in ["hard", "moderate", "easy", "new"]:
        raise ValueError("Category must be hard, moderate, easy, or new")
    
    # Map "new" to "moderate" for storage (new topics are not hard yet)
    storage_category = "moderate" if category == "new" else category
    
    topics = get_user_topics(user_id)
    
    if topic not in topics[storage_category]:
        topics[storage_category][topic] = {
            "papers": [],
            "added_at": datetime.now().isoformat(),
            "section": section,
            "original_category": category  # Track if it was marked as "new"
        }
    
    # Check if paper already exists
    paper_exists = any(p["id"] == paper_id for p in topics[storage_category][topic]["papers"])
    
    if not paper_exists:
        topics[storage_category][topic]["papers"].append({
            "id": paper_id,
            "title": paper_title,
            "added_at": datetime.now().isoformat()
        })
    
    return topics[storage_category][topic]


def move_topic(user_id: str, topic: str, from_category: str, to_category: str) -> bool:
    """Move a topic from one category to another"""
    topics = get_user_topics(user_id)
    
    if topic in topics[from_category]:
        topic_data = topics[from_category][topic]
        del topics[from_category][topic]
        topics[to_category][topic] = topic_data
        topics[to_category][topic]["moved_at"] = datetime.now().isoformat()
        return True
    
    return False


def get_all_topics_by_category(user_id: str) -> Dict:
    """Get all topics grouped by category"""
    topics = get_user_topics(user_id)
    return {
        "hard": topics["hard"],
        "moderate": topics["moderate"],
        "easy": topics["easy"]
    }


def get_papers_for_topic(user_id: str, topic: str) -> List[Dict]:
    """Get all papers for a specific topic"""
    topics = get_user_topics(user_id)
    for category in ["hard", "moderate", "easy"]:
        if topic in topics[category]:
            return topics[category][topic]["papers"]
    return []


def get_motivational_message(user_id: str) -> str:
    """Get a motivational message based on user's progress"""
    topics = get_user_topics(user_id)
    
    hard_count = len(topics["hard"])
    moderate_count = len(topics["moderate"])
    easy_count = len(topics["easy"])
    
    if hard_count == 0 and moderate_count == 0:
        return "Amazing! You've mastered all your topics! You're a research expert!"
    elif hard_count == 0:
        return "Great job! All your topics are now Easy or Moderate. Keep reading!"
    elif hard_count <= 3:
        return f"You have {hard_count} Hard topics. You've mastered {easy_count} topics already! You can do this!"
    else:
        return f"You have {hard_count} Hard topics. Don't give up! Every paper you read helps you improve."


def get_topic_summary(user_id: str) -> Dict:
    """Get summary counts for all categories"""
    topics = get_user_topics(user_id)
    return {
        "hard_count": len(topics["hard"]),
        "moderate_count": len(topics["moderate"]),
        "easy_count": len(topics["easy"]),
        "total_topics": len(topics["hard"]) + len(topics["moderate"]) + len(topics["easy"]),
        "message": get_motivational_message(user_id)
    }
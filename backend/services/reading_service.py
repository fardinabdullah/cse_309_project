from datetime import datetime
from typing import Dict, Any, List

def update_progress(paper_id: str, user_id: str, current_page: int, total_pages: int) -> Dict[str, Any]:
    """Update reading progress for a paper"""
    progress_percentage = round((current_page / total_pages) * 100, 1) if total_pages > 0 else 0
    
    return {
        "paper_id": paper_id,
        "user_id": user_id,
        "current_page": current_page,
        "total_pages": total_pages,
        "progress_percentage": progress_percentage,
        "last_read": datetime.now().isoformat()
    }


def get_progress(paper_id: str, user_id: str, reading_data: Dict) -> Dict[str, Any]:
    """Get reading progress for a paper"""
    data = reading_data.get(paper_id, {})
    
    return {
        "current_page": data.get("current_page", 0),
        "total_pages": data.get("total_pages", 0),
        "progress_percentage": data.get("progress_percentage", 0),
        "last_read": data.get("last_read", "Never"),
        "reading_time": data.get("reading_time", 0)
    }


def get_section_completion(sections: List[Dict], current_page: int, total_pages: int) -> List[Dict]:
    """Calculate which sections are completed"""
    if not sections or total_pages == 0:
        return []
    
    completed = []
    sections_per_page = len(sections) / total_pages
    
    for section in sections:
        section_index = sections.index(section)
        estimated_page = (section_index + 1) / sections_per_page if sections_per_page > 0 else 0
        is_completed = current_page >= estimated_page
        
        difficulty = "normal"
        name_lower = section.get("name", "").lower()
        if name_lower in ["results", "discussion", "conclusion"]:
            difficulty = "hard"
        elif name_lower in ["introduction", "methods", "background"]:
            difficulty = "easy"
        
        completed.append({
            "name": section.get("name", "Unknown"),
            "is_completed": is_completed,
            "difficulty": difficulty,
            "status": "Completed" if is_completed else "Not Started"
        })
    
    return completed


def search_in_paper(file_path: str, query: str) -> List[Dict]:
    """Search for text within a single paper"""
    import pdfplumber
    
    results = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and query.lower() in text.lower():
                    lines = text.split('\n')
                    for line in lines:
                        if query.lower() in line.lower():
                            results.append({
                                "page": i + 1,
                                "text": line.strip(),
                                "context": line.strip()[:200]
                            })
    except Exception as e:
        print(f"Error searching PDF: {e}")
    
    return results
from pydantic import BaseModel
from typing import Optional, List


class Section(BaseModel):
    name: str
    keyword: str
    start_page: int
    content_preview: Optional[str] = None


class Paper(BaseModel):
    paper_id: Optional[str] = None
    workspace_id: str
    title: str
    authors: str
    year: str
    journal: str
    doi: Optional[str] = None
    file_id: Optional[str] = None
    filename: str
    file_path: Optional[str] = None
    pages: int = 0
    sections: List[Section] = []
    uploaded_at: Optional[str] = None
    uploaded_by: Optional[str] = None


class ReadingProgress(BaseModel):
    paper_id: str
    user_id: str
    current_page: int = 0
    total_pages: int = 0
    progress_percentage: float = 0.0
    pages_read: int = 0
    reading_time: int = 0
    last_read: Optional[str] = None
    section_completion: List[str] = []


class DifficultyAnalysis(BaseModel):
    section_name: str
    speed: float
    is_difficult: bool
    difficulty_level: str
    ratio: float
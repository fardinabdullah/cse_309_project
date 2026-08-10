import pdfplumber
import re
import os
from typing import List, Dict, Any
import httpx


# ============================================
# 1. METADATA EXTRACTION
# ============================================

def extract_metadata_from_pdf(file_path: str) -> Dict[str, Any]:
    """Extract title, authors, year, journal, sections from PDF"""
    
    metadata = {
        "title": "Unknown",
        "authors": "Unknown",
        "year": "Unknown",
        "journal": "Unknown",
        "pages": 0,
        "sections": []
    }
    
    try:
        with pdfplumber.open(file_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text
            
            metadata["pages"] = len(pdf.pages)
            metadata["title"] = extract_title(full_text)
            metadata["authors"] = extract_authors(full_text)
            metadata["year"] = extract_year(full_text)
            metadata["journal"] = extract_journal(full_text)
            metadata["sections"] = extract_sections(full_text)
            
    except Exception as e:
        print(f"Error extracting metadata: {e}")
    
    return metadata


def extract_title(text: str) -> str:
    lines = text.split('\n')
    for line in lines[:20]:
        line = line.strip()
        if len(line) > 20 and len(line) < 200 and (line.isupper() or len(line) > 30):
            return line[:150]
    return lines[0][:100] if lines else "Unknown"


def extract_authors(text: str) -> str:
    lines = text.split('\n')
    for line in lines[:30]:
        pattern = r'([A-Z][a-z]+ [A-Z][a-z]+)|([A-Z][a-z]+,\s?[A-Z]\.)'
        matches = re.findall(pattern, line)
        if matches:
            authors = [m[0] or m[1] for m in matches]
            return ', '.join(authors[:5])
    return "Unknown"


def extract_year(text: str) -> str:
    pattern = r'(20\d{2})|(19\d{2})'
    matches = re.findall(pattern, text)
    years = [m[0] or m[1] for m in matches]
    if years:
        return max(years)
    return "Unknown"


def extract_journal(text: str) -> str:
    lines = text.split('\n')
    keywords = ['Journal', 'Nature', 'Science', 'Cell', 'Proceedings', 'Transactions', 'Review']
    for line in lines:
        for keyword in keywords:
            if keyword.lower() in line.lower():
                return line.strip()[:100]
    return "Unknown"


def extract_sections(text: str) -> List[Dict[str, Any]]:
    section_keywords = [
        'introduction', 'background', 'methods', 'methodology',
        'results', 'discussion', 'conclusion', 'references',
        'abstract', 'acknowledgment'
    ]
    
    sections = []
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for keyword in section_keywords:
            if line_lower.startswith(keyword) or line_lower == keyword:
                if len(line) < 50:
                    content = '\n'.join(lines[i+1:i+5])[:200]
                    sections.append({
                        "name": line.strip(),
                        "keyword": keyword,
                        "start_page": 1,
                        "content_preview": content
                    })
                    break
    
    if not sections:
        sections = [
            {"name": "Introduction", "keyword": "introduction", "start_page": 1, "content_preview": "..."},
            {"name": "Methods", "keyword": "methods", "start_page": 1, "content_preview": "..."},
            {"name": "Results", "keyword": "results", "start_page": 1, "content_preview": "..."},
            {"name": "Discussion", "keyword": "discussion", "start_page": 1, "content_preview": "..."}
        ]
    
    return sections


# ============================================
# 2. SEARCH INSIDE PDFs
# ============================================

def search_in_pdf(file_path: str, query: str) -> List[Dict[str, Any]]:
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
                                "context": line.strip()[:300]
                            })
    except Exception as e:
        print(f"Error searching PDF: {e}")
    
    return results


def search_across_papers(papers: List[Dict], query: str) -> List[Dict]:
    all_results = []
    for paper in papers:
        file_path = paper.get("file_path")
        if file_path and os.path.exists(file_path):
            matches = search_in_pdf(file_path, query)
            if matches:
                all_results.append({
                    "paper_title": paper.get("title", "Unknown"),
                    "paper_id": str(paper.get("_id")),
                    "matches": matches
                })
    return all_results


# ============================================
# 3. READING PROGRESS
# ============================================

def calculate_progress(current_page: int, total_pages: int) -> float:
    if total_pages == 0:
        return 0.0
    return round((current_page / total_pages) * 100, 1)


def get_section_completion(sections: List[Dict], current_page: int, total_pages: int) -> List[str]:
    if not sections or total_pages == 0:
        return []
    
    completed = []
    sections_per_page = len(sections) / total_pages
    
    for section in sections:
        section_index = sections.index(section)
        estimated_page = (section_index + 1) / sections_per_page if sections_per_page > 0 else 0
        if current_page >= estimated_page:
            completed.append(section.get("name", "Unknown"))
    
    return completed


# ============================================
# 4. DIFFICULTY DETECTION
# ============================================

def detect_difficulty(section_speed: float, average_speed: float = 200) -> Dict[str, Any]:
    if section_speed == 0:
        return {"is_difficult": False, "ratio": 1.0, "difficulty_level": "normal"}
    
    ratio = round(average_speed / section_speed, 1) if section_speed > 0 else 1.0
    is_difficult = ratio > 1.5
    
    difficulty_level = "normal"
    if ratio >= 2.5:
        difficulty_level = "very_hard"
    elif ratio >= 1.8:
        difficulty_level = "hard"
    elif ratio >= 1.3:
        difficulty_level = "moderate"
    
    return {
        "is_difficult": is_difficult,
        "ratio": ratio,
        "difficulty_level": difficulty_level,
        "average_speed": average_speed,
        "your_speed": section_speed
    }


# ============================================
# 5. GOOGLE SCHOLAR SEARCH (Solution Finder)
# ============================================

async def search_google_scholar(topic: str) -> List[Dict[str, Any]]:
    crossref_url = f"https://api.crossref.org/works?query={topic}&rows=5"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(crossref_url, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                items = data.get("message", {}).get("items", [])
                results = []
                for item in items[:5]:
                    title = item.get("title", ["Unknown"])[0]
                    authors = ", ".join([a.get("family", "") for a in item.get("author", [])[:3]])
                    year = item.get("issued", {}).get("date-parts", [[None]])[0][0]
                    doi = item.get("DOI", "")
                    results.append({
                        "title": title,
                        "authors": authors or "Unknown",
                        "year": year or "Unknown",
                        "doi": doi,
                        "url": f"https://doi.org/{doi}" if doi else "",
                        "source": "CrossRef API"
                    })
                return results
    except Exception as e:
        print(f"Error searching CrossRef: {e}")
    
    return [{
        "title": f"Search Google Scholar for: {topic}",
        "authors": "Click to search",
        "year": "",
        "doi": "",
        "url": f"https://scholar.google.com/scholar?q={topic.replace(' ', '+')}",
        "source": "Google Scholar"
    }]


async def find_solutions_for_difficult_topic(topic: str) -> Dict[str, Any]:
    papers = await search_google_scholar(topic)
    
    return {
        "topic": topic,
        "papers": papers,
        "youtube": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+explained",
        "wikipedia": f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",
        "google_scholar": f"https://scholar.google.com/scholar?q={topic.replace(' ', '+')}"
    }


# ============================================
# 6. DASHBOARD
# ============================================

def calculate_dashboard_stats(papers: List[Dict]) -> Dict[str, Any]:
    total_papers = len(papers)
    
    years = {}
    for paper in papers:
        year = paper.get("year", "Unknown")
        years[year] = years.get(year, 0) + 1
    
    topics = {}
    for paper in papers:
        title = paper.get("title", "")
        words = title.split()
        topic = words[0] if words and len(words[0]) > 3 else "General"
        topics[topic] = topics.get(topic, 0) + 1
    
    authors = {}
    for paper in papers:
        author = paper.get("authors", "Unknown")
        if author != "Unknown":
            first_author = author.split(',')[0].strip()
            authors[first_author] = authors.get(first_author, 0) + 1
    
    sorted_authors = sorted(authors.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_papers": total_papers,
        "papers_by_year": years,
        "papers_by_topic": topics,
        "most_read_authors": sorted_authors
    }
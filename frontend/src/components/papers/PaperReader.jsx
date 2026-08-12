import { useState, useEffect, useRef } from 'react';
import { 
    FiArrowLeft, 
    FiClock, 
    FiBook, 
    FiBarChart2, 
    FiSearch, 
    FiZoomIn, 
    FiZoomOut, 
    FiMaximize,
    FiMinimize
} from 'react-icons/fi';
import TopicRating from './TopicRating';
import { PAPERS_URL, READING_URL } from '../../api/config';

function PaperReader({ paper, workspaceId, onBack }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [readingData, setReadingData] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [savingProgress, setSavingProgress] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isReaderOpen, setIsReaderOpen] = useState(false);

    const [pageStartTime, setPageStartTime] = useState(Date.now());
    const [pageViewedPages, setPageViewedPages] = useState(new Set());
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const [showRating, setShowRating] = useState(true);

    const pdfContainerRef = useRef(null);
    const iframeRef = useRef(null);
    const paperId = paper._id || paper.file_id || paper.paper_id;

    const pageTimerRef = useRef({});

    useEffect(() => {
        if (paper) {
            fetchProgress();
            loadPDF();
        }
    }, [paper]);

    const loadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${PAPERS_URL}/view/${paperId}?workspace_id=${workspaceId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('PDF load error:', error);
                return;
            }

            const blob = await response.blob();
            if (!blob.type.includes('pdf')) {
                console.error('Not a PDF:', blob.type);
                return;
            }

            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            if (paper.pages && paper.pages > 0) {
                setTotalPages(paper.pages);
            }
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    };

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${READING_URL}/progress/${paperId}?workspace_id=${workspaceId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.ok) {
                console.error('Failed to fetch progress:', response.status);
                return;
            }

            const data = await response.json();
            setReadingData(data.progress);
            setSections(data.sections || []);

            if (data.progress?.current_page) {
                setCurrentPage(data.progress.current_page);
            }
            if (data.progress?.total_pages > 0) {
                setTotalPages(data.progress.total_pages);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async (page) => {
        setSavingProgress(true);
        setSaveMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${READING_URL}/progress?paper_id=${paperId}&workspace_id=${workspaceId}&page=${page}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                setSaveMessage('Failed to save progress');
                return;
            }

            const data = await response.json();
            setCurrentPage(page);
            setReadingData(data.progress);
            setSaveMessage('Progress saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error updating progress:', error);
            setSaveMessage('Error saving progress');
        } finally {
            setSavingProgress(false);
        }
    };

    const goToPage = (page, fromScroll = false) => {
        const targetPage = Math.max(1, Math.min(totalPages, page));
        
        const timeOnPage = (Date.now() - pageStartTime) / 1000;
        const isReading = timeOnPage >= 45 || pageViewedPages.has(targetPage) || !fromScroll;
        
        if (isReading && targetPage !== currentPage) {
            setPageViewedPages(prev => new Set(prev).add(targetPage));
            saveProgress(targetPage);
            pageTimerRef.current[targetPage] = (pageTimerRef.current[targetPage] || 0) + timeOnPage;
        }
        
        setCurrentPage(targetPage);
        setPageStartTime(Date.now());

        if (iframeRef.current && pdfUrl) {
            iframeRef.current.src = `${pdfUrl}#page=${targetPage}`;
        }
    };

    const zoomIn = () => setZoomLevel(Math.min(200, zoomLevel + 10));
    const zoomOut = () => setZoomLevel(Math.max(50, zoomLevel - 10));

    const toggleFullscreen = async () => {
        const container = pdfContainerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            try {
                await container.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.log('Fullscreen error:', err);
            }
        } else {
            try {
                await document.exitFullscreen();
                setIsFullscreen(false);
            } catch (err) {
                console.log('Exit fullscreen error:', err);
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleIframeScroll = (e) => {
        try {
            const iframe = iframeRef.current;
            if (!iframe) return;

            const scrollY = iframe.contentWindow?.scrollY || 0;
            const clientHeight = iframe.contentWindow?.innerHeight || 0;
            
            if (scrollY > clientHeight * 0.5) {
                setIsScrolling(true);
                clearTimeout(scrollTimeout);
                setScrollTimeout(setTimeout(() => {
                    const timeOnPage = (Date.now() - pageStartTime) / 1000;
                    if (timeOnPage > 10 || pageViewedPages.has(currentPage)) {
                        goToPage(currentPage + 1, true);
                    }
                    setIsScrolling(false);
                }, 500));
            } else if (scrollY < clientHeight * 0.2) {
                setIsScrolling(true);
                clearTimeout(scrollTimeout);
                setScrollTimeout(setTimeout(() => {
                    goToPage(currentPage - 1, true);
                    setIsScrolling(false);
                }, 500));
            }
        } catch (err) {
            console.log('Scroll tracking limited:', err.message);
        }
    };

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            try {
                iframe.addEventListener('load', () => {
                    try {
                        const doc = iframe.contentDocument;
                        if (doc) {
                            doc.addEventListener('scroll', handleIframeScroll);
                            doc.addEventListener('wheel', handleIframeScroll);
                        }
                    } catch (e) {
                        console.log('Cannot attach scroll events:', e.message);
                    }
                });
            } catch (e) {
                console.log('Cannot attach iframe events:', e.message);
            }
        }
        return () => {
            if (iframe) {
                try {
                    const doc = iframe.contentDocument;
                    if (doc) {
                        doc.removeEventListener('scroll', handleIframeScroll);
                        doc.removeEventListener('wheel', handleIframeScroll);
                    }
                } catch (e) {}
            }
        };
    }, [iframeRef.current]);

    useEffect(() => {
        const interval = setInterval(() => {
            const timeOnPage = (Date.now() - pageStartTime) / 1000;
            if (timeOnPage >= 45 && currentPage > 0 && !pageViewedPages.has(currentPage)) {
                setPageViewedPages(prev => new Set(prev).add(currentPage));
                saveProgress(currentPage);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [currentPage, pageStartTime]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${READING_URL}/search/${paperId}?query=${encodeURIComponent(searchQuery)}&workspace_id=${workspaceId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const getDifficultyClass = (difficulty) => {
        if (difficulty === 'hard') return 'hard';
        if (difficulty === 'moderate') return 'moderate';
        if (difficulty === 'easy') return 'easy';
        return 'normal';
    };

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    useEffect(() => {
        if (pdfUrl && iframeRef.current) {
            iframeRef.current.src = `${pdfUrl}#page=${currentPage}`;
        }
    }, [pdfUrl]);

    if (loading) {
        return <div className="reader-loading">Loading paper...</div>;
    }

    const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
    const formattedLastRead = readingData?.last_read
        ? new Date(readingData.last_read).toLocaleString()
        : 'Never';

    return (
        <div className="paper-reader">
            {/* Header */}
            <div className="reader-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft /> Back to Papers
                </button>
                <h2>{paper.title || 'Untitled Paper'}</h2>
                <div className="reader-meta">
                    <span><FiBook /> {paper.authors || 'Unknown Author'}</span>
                    <span>{paper.year || 'Unknown Year'}</span>
                </div>
            </div>

            {/* Progress Section */}
            <div className="reader-progress-section">
                <div className="progress-card">
                    <h3>Reading Progress</h3>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="progress-stats">
                        <span><FiBook /> Page {currentPage || 0} of {totalPages || 0}</span>
                        <span><FiBarChart2 /> {Math.min(progressPercentage, 100)}% Complete</span>
                        <span><FiClock /> Last read: {formattedLastRead}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                            ⏱️ {Math.round((Date.now() - pageStartTime) / 1000)}s on this page
                        </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        📖 Pages read: {pageViewedPages.size} of {totalPages}
                    </div>
                    {saveMessage && (
                        <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                            {saveMessage}
                        </div>
                    )}
                </div>

                <div className="sections-card">
                    <h3>Sections</h3>
                    {sections && sections.length > 0 ? (
                        <div className="sections-list">
                            {sections.map((section, index) => (
                                <div key={index} className="section-item">
                                    <span className={`section-status ${section.is_completed ? 'complete' : 'pending'}`}>
                                        {section.is_completed ? 'Complete' : 'Not Started'}
                                    </span>
                                    <span className="section-name">{section.name}</span>
                                    <span className={`section-difficulty ${getDifficultyClass(section.difficulty)}`}>
                                        {section.difficulty || 'Normal'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-sections">No sections detected</p>
                    )}
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="pdf-viewer">
                <div className="pdf-toolbar">
                    <h3>PDF Viewer</h3>
                    <div className="pdf-toolbar-controls">
                        <button onClick={zoomOut} title="Zoom Out">
                            <FiZoomOut />
                        </button>
                        <span className="zoom-level">{zoomLevel}%</span>
                        <button onClick={zoomIn} title="Zoom In">
                            <FiZoomIn />
                        </button>
                        <button 
                            onClick={toggleFullscreen} 
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            style={{
                                background: isFullscreen ? 'rgba(59, 130, 246, 0.3)' : '',
                                color: isFullscreen ? '#60a5fa' : ''
                            }}
                        >
                            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                        </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {isScrolling ? '📱 Scrolling...' : '🖱️ Scroll to change pages'}
                    </div>
                </div>

                <div className="pdf-container" ref={pdfContainerRef} style={{ position: 'relative' }}>
                    {pdfUrl ? (
                        <iframe
                            ref={iframeRef}
                            key={pdfUrl + currentPage}
                            src={`${pdfUrl}#page=${currentPage}`}
                            title={paper.title}
                            width="100%"
                            height="600px"
                            className="pdf-iframe"
                            style={{ zoom: zoomLevel / 100 }}
                        />
                    ) : (
                        <div className="pdf-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading PDF...</p>
                        </div>
                    )}
                </div>

                <div className="pdf-controls">
                    <button
                        onClick={() => goToPage(currentPage - 1, false)}
                        disabled={currentPage <= 1 || savingProgress}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage || 0} of {totalPages || 0}</span>
                    <button
                        onClick={() => goToPage(currentPage + 1, false)}
                        disabled={currentPage >= totalPages || savingProgress}
                    >
                        Next
                    </button>
                    <button
                        onClick={() => saveProgress(currentPage)}
                        className="save-btn"
                        disabled={savingProgress}
                    >
                        {savingProgress ? 'Saving...' : 'Save Progress'}
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div className="paper-search-section">
                <h3>Search within this paper</h3>
                <div className="paper-search-bar">
                    <input
                        type="text"
                        placeholder="Search in this paper..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>
                        <FiSearch /> Search
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <p>Found {searchResults.length} results:</p>
                        {searchResults.map((result, i) => (
                            <div key={i} className="search-result-item">
                                <span className="page-number">Page {result.page}:</span>
                                <span className="result-text">{result.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔥 Topic Rating Section */}
            {showRating && (
                <TopicRating 
                    paperId={paperId}
                    workspaceId={workspaceId}
                    section="Current Section"
                    paperTitle={paper.title || 'Untitled Paper'}
                    onRated={() => {
                        setShowRating(false);
                        // Refresh dashboard data
                    }}
                />
            )}
        </div>
    );
}

export default PaperReader;
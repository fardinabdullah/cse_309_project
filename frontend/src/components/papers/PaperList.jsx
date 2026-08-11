import { FiFile, FiUser, FiCalendar, FiBook, FiTrash2, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import { deletePaper } from '../../api/paperApi';

function PaperList({ papers, workspaceId, onPaperDeleted, onPaperClick }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDeletePaper = async (paperId, paperTitle, e) => {
        e.stopPropagation();
        if (!paperId || paperId === 'undefined' || paperId === 'null') {
            alert('Error: This paper does not have a valid ID and cannot be deleted.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete "${paperTitle}"?`)) return;
        setDeletingId(paperId);
        try {
            await deletePaper(workspaceId, paperId);
            alert('Paper deleted successfully!');
            if (onPaperDeleted) onPaperDeleted();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete paper. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    if (!papers || papers.length === 0) {
        return (
            <div className="paper-list-empty">
                <p>No papers uploaded yet</p>
                <p className="hint">Upload your first research paper above</p>
            </div>
        );
    }

    return (
        <div className="paper-list">
            <div className="paper-list-header">
                <h3>Research Papers ({papers.length})</h3>
                <span className="paper-count-badge">{papers.length} papers</span>
            </div>
            <div className="paper-grid">
                {papers.map((paper, index) => {
                    const paperId = paper._id || paper.file_id || paper.paper_id;
                    const isDeleting = deletingId === paperId;
                    const displayTitle = paper.title && paper.title !== 'Unknown' 
                        ? paper.title 
                        : `Paper ${index + 1}`;

                    return (
                        <div 
                            key={index} 
                            className="paper-card"
                            onClick={() => { 
                                if (onPaperClick) {
                                    onPaperClick(paper);
                                }
                            }}
                        >
                            <div className="paper-icon">
                                <FiFile size={24} />
                            </div>
                            <div className="paper-info">
                                <h4>{displayTitle}</h4>
                                <p className="paper-meta">
                                    <FiUser size={14} /> {paper.authors || 'Unknown Author'}
                                </p>
                                <p className="paper-meta">
                                    <FiCalendar size={14} /> {paper.year || 'Unknown Year'}
                                </p>
                                <p className="paper-meta">
                                    <FiBook size={14} /> {paper.journal || 'Unknown Journal'}
                                </p>
                                {paper.pages > 0 && (
                                    <span className="paper-pages-badge">Pages: {paper.pages}</span>
                                )}
                            </div>
                            <div className="paper-actions">
                                <button 
                                    className="view-btn"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (onPaperClick) onPaperClick(paper); 
                                    }} 
                                    title="Open this paper"
                                >
                                    <FiEye size={16} />
                                </button>
                                <button 
                                    className="delete-btn"
                                    onClick={(e) => handleDeletePaper(paperId, displayTitle, e)} 
                                    disabled={isDeleting || !paperId} 
                                    title={!paperId ? "Cannot delete: Invalid ID" : "Delete this paper"}
                                >
                                    {isDeleting ? '...' : <FiTrash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PaperList;
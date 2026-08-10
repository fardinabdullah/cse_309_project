import { FiFile, FiUser, FiCalendar, FiBook, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { deletePaper } from '../../api/paperApi';

function PaperList({ papers, workspaceId, onPaperDeleted }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDeletePaper = async (paperId, paperTitle) => {
        // 1. Validate the ID
        if (!paperId || paperId === 'undefined' || paperId === 'null') {
            alert('Error: This paper does not have a valid ID and cannot be deleted.');
            return;
        }

        // 2. Ask for confirmation
        if (!window.confirm(`Are you sure you want to delete "${paperTitle}"?`)) {
            return;
        }

        setDeletingId(paperId);

        try {
            // 3. Call the API
            await deletePaper(workspaceId, paperId);
            alert('Paper deleted successfully!');
            
            // 4. Refresh the list
            if (onPaperDeleted) {
                onPaperDeleted();
            }
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
            <h3>Research Papers ({papers.length})</h3>
            <div className="paper-grid">
                {papers.map((paper, index) => {
                    // FIX: Get the correct ID (checking both _id and file_id)
                    // Some papers (like DOI imports) might have file_id instead of _id
                    const paperId = paper._id || paper.file_id || paper.paper_id;
                    const isDeleting = deletingId === paperId;

                    // FIX: Fallback title for papers without a title
                    const displayTitle = paper.title && paper.title !== 'Unknown' 
                        ? paper.title 
                        : `Paper ${index + 1}`;

                    return (
                        <div key={index} className="paper-card">
                            <div className="paper-icon">
                                <FiFile size={24} />
                            </div>
                            <div className="paper-info">
                                <h4>{displayTitle}</h4>
                                <p><FiUser size={14} /> {paper.authors || 'Unknown Author'}</p>
                                <p><FiCalendar size={14} /> {paper.year || 'Unknown Year'}</p>
                                <p><FiBook size={14} /> {paper.journal || 'Unknown Journal'}</p>
                                {paper.pages > 0 && (
                                    <span className="paper-pages">Pages: {paper.pages}</span>
                                )}
                            </div>
                            <div className="paper-actions">
                                <button
                                    className="delete-paper-btn"
                                    onClick={() => handleDeletePaper(paperId, displayTitle)}
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
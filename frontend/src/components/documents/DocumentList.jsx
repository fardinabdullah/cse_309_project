import { FiFile, FiTrash2, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import { deleteDocument } from '../../api/documentApi';
import { DOCUMENTS_URL } from '../../api/config';

function DocumentList({ documents, workspaceId, onDocumentDeleted, onDocumentClick }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (docId, docName) => {
        if (!window.confirm(`Delete "${docName}"?`)) return;
        setDeletingId(docId);
        try {
            await deleteDocument(workspaceId, docId);
            alert('Document deleted!');
            if (onDocumentDeleted) {
                onDocumentDeleted();
            }
        } catch (error) {
            alert('Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    // View document with authentication
    const handleView = async (doc) => {
        const docId = doc._id || doc.file_id;
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(
                `${DOCUMENTS_URL}/view/${docId}?workspace_id=${workspaceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                alert('Error: ' + (error.detail || 'Failed to load document'));
                return;
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('View error:', error);
            alert('Failed to load document');
        }
    };

    const handleDocumentClick = (doc) => {
        if (onDocumentClick) {
            onDocumentClick(doc);
        } else {
            handleView(doc);
        }
    };

    if (!documents || documents.length === 0) {
        return (
            <div className="document-list-empty">
                <p>No documents uploaded yet</p>
                <p className="hint">Upload your first document above</p>
            </div>
        );
    }

    return (
        <div className="document-list">
            <h3>📁 Documents ({documents.length})</h3>
            <div className="document-grid">
                {documents.map((doc, index) => {
                    const docId = doc._id || doc.file_id;
                    const isDeleting = deletingId === docId;

                    return (
                        <div 
                            key={index} 
                            className="document-card clickable"
                            onClick={() => handleDocumentClick(doc)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="document-icon">
                                <FiFile size={24} />
                            </div>
                            <div className="document-info">
                                <h4>{doc.name || doc.filename}</h4>
                                <p className="doc-meta">
                                    {doc.file_type || 'Unknown'} • {(doc.file_size / 1024).toFixed(1)} KB
                                </p>
                                <p className="doc-meta">
                                    v{doc.current_version || 1} • {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown'}
                                </p>
                            </div>
                            <div className="document-actions">
                                <button 
                                    className="view-doc-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleView(doc);
                                    }}
                                    title="View"
                                >
                                    <FiEye size={16} />
                                </button>
                                <button 
                                    className="delete-doc-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(docId, doc.name || doc.filename);
                                    }}
                                    disabled={isDeleting}
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

export default DocumentList;
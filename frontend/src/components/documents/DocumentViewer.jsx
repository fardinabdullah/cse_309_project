import { useState, useEffect } from 'react';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import { DOCUMENTS_URL } from '../../api/config';

function DocumentViewer({ document, workspaceId, onBack }) {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const docId = document._id || document.file_id;

    useEffect(() => {
        loadDocument();
    }, []);

    const loadDocument = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${DOCUMENTS_URL}/view/${docId}?workspace_id=${workspaceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to load document');
                setLoading(false);
                return;
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
        } catch (error) {
            console.error('Load document error:', error);
            setError('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type) => {
        const icons = {
            'pdf': '📄',
            'word': '📝',
            'excel': '📊',
            'powerpoint': '📑',
            'image': '🖼️',
            'text': '📃',
            'other': '📁'
        };
        return icons[type] || '📁';
    };

    const getFileTypeLabel = (type) => {
        const labels = {
            'pdf': 'PDF Document',
            'word': 'Word Document',
            'excel': 'Excel Spreadsheet',
            'powerpoint': 'PowerPoint Presentation',
            'image': 'Image',
            'text': 'Text File',
            'other': 'Document'
        };
        return labels[type] || 'Document';
    };

    if (loading) {
        return (
            <div className="document-viewer">
                <div className="viewer-header">
                    <button className="back-btn" onClick={onBack}>
                        <FiArrowLeft /> Back to Documents
                    </button>
                    <div className="viewer-info">
                        <span className="viewer-icon">{getFileIcon(document.file_type)}</span>
                        <h2>{document.name || document.filename}</h2>
                    </div>
                </div>
                <div className="viewer-content">
                    <div className="loading-text">Loading document...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="document-viewer">
                <div className="viewer-header">
                    <button className="back-btn" onClick={onBack}>
                        <FiArrowLeft /> Back to Documents
                    </button>
                    <div className="viewer-info">
                        <span className="viewer-icon">{getFileIcon(document.file_type)}</span>
                        <h2>{document.name || document.filename}</h2>
                    </div>
                </div>
                <div className="viewer-content">
                    <div className="error-text">
                        <p>❌ {error}</p>
                        <button onClick={loadDocument} className="retry-btn">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine what to render based on file type
    const renderPreview = () => {
        if (!fileUrl) {
            return (
                <div className="default-preview">
                    <div className="file-icon-large">{getFileIcon(document.file_type)}</div>
                    <h3>{document.name || document.filename}</h3>
                    <p>File type: {getFileTypeLabel(document.file_type)}</p>
                    <a 
                        href={`${DOCUMENTS_URL}/view/${docId}?workspace_id=${workspaceId}`}
                        className="download-file-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FiDownload /> Download File
                    </a>
                </div>
            );
        }

        // Image preview
        if (document.file_type === 'image') {
            return (
                <div className="image-preview">
                    <img 
                        src={fileUrl} 
                        alt={document.name || document.filename}
                        className="document-image"
                    />
                </div>
            );
        }

        // PDF preview
        if (document.file_type === 'pdf') {
            return (
                <div className="pdf-preview">
                    <iframe
                        src={fileUrl}
                        title={document.name || document.filename}
                        width="100%"
                        height="100%"
                        className="pdf-iframe"
                    />
                </div>
            );
        }

        // Text file preview
        if (document.file_type === 'text') {
            return (
                <div className="text-preview">
                    <iframe
                        src={fileUrl}
                        title={document.name || document.filename}
                        width="100%"
                        height="100%"
                        className="text-iframe"
                        style={{ border: 'none', background: '#1a1a2e', color: '#e2e8f0' }}
                    />
                </div>
            );
        }

        // Word, Excel, PowerPoint - show with download option (can't preview in browser)
        if (['word', 'excel', 'powerpoint'].includes(document.file_type)) {
            return (
                <div className="office-preview">
                    <div className="office-icon">{getFileIcon(document.file_type)}</div>
                    <h3>{document.name || document.filename}</h3>
                    <p>This document requires Microsoft Office or compatible software to view.</p>
                    <div className="office-actions">
                        <a 
                            href={fileUrl} 
                            download={document.filename}
                            className="download-file-btn"
                        >
                            <FiDownload /> Download to View
                        </a>
                        <a 
                            href={`${DOCUMENTS_URL}/view/${docId}?workspace_id=${workspaceId}`}
                            className="open-in-new-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open in New Tab
                        </a>
                    </div>
                </div>
            );
        }

        // Default fallback
        return (
            <div className="default-preview">
                <div className="file-icon-large">{getFileIcon(document.file_type)}</div>
                <h3>{document.name || document.filename}</h3>
                <p>File type: {getFileTypeLabel(document.file_type)}</p>
                <a 
                    href={fileUrl} 
                    download={document.filename}
                    className="download-file-btn"
                >
                    <FiDownload /> Download File
                </a>
            </div>
        );
    };

    return (
        <div className="document-viewer">
            <div className="viewer-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft /> Back to Documents
                </button>
                <div className="viewer-info">
                    <span className="viewer-icon">{getFileIcon(document.file_type)}</span>
                    <h2>{document.name || document.filename}</h2>
                    <p className="viewer-meta">
                        {getFileTypeLabel(document.file_type)} • {(document.file_size / 1024).toFixed(1)} KB • v{document.current_version || 1}
                    </p>
                </div>
                <a 
                    href={fileUrl || `${DOCUMENTS_URL}/view/${docId}?workspace_id=${workspaceId}`}
                    download={document.filename}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FiDownload /> Download
                </a>
            </div>

            <div className="viewer-content">
                {renderPreview()}
            </div>

            <div className="viewer-footer">
                <span className="file-info">
                    Uploaded: {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'Unknown'}
                </span>
                <span className="file-info">
                    File size: {(document.file_size / 1024).toFixed(1)} KB
                </span>
            </div>
        </div>
    );
}

export default DocumentViewer;
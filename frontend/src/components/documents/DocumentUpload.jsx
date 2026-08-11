import { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { uploadDocument, bulkUploadDocuments } from '../../api/documentApi';

function DocumentUpload({ workspaceId, onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadType, setUploadType] = useState('single');

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setMessage('');
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        setMessage('');

        try {
            let response;
            if (uploadType === 'bulk' && files.length > 1) {
                response = await bulkUploadDocuments(workspaceId, files);
            } else {
                response = await uploadDocument(workspaceId, files[0]);
            }
            setMessage(`✅ ${response.message}`);
            setFiles([]);
            if (onUploadComplete) onUploadComplete(response);
        } catch (error) {
            setMessage(`❌ Upload failed: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="document-upload">
            <h3>📄 Upload Documents</h3>
            
            <div className="upload-tabs">
                <button 
                    className={uploadType === 'single' ? 'active' : ''}
                    onClick={() => { setUploadType('single'); setMessage(''); }}
                >
                    <FiUpload /> Single
                </button>
                <button 
                    className={uploadType === 'bulk' ? 'active' : ''}
                    onClick={() => { setUploadType('bulk'); setMessage(''); }}
                >
                    <FiFile /> Bulk
                </button>
            </div>

            <div className="file-input">
                <input 
                    type="file" 
                    multiple={uploadType === 'bulk'}
                    onChange={handleFileChange}
                />
                {files.length > 0 && (
                    <div className="file-info">
                        <span>{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                        <button onClick={() => setFiles([])}><FiX /></button>
                    </div>
                )}
                <button 
                    className="upload-btn" 
                    onClick={handleUpload} 
                    disabled={!files.length || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </div>

            {message && <div className="upload-message">{message}</div>}
        </div>
    );
}

export default DocumentUpload;
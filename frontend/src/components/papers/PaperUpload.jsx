import { useState } from 'react';
import { FiUpload, FiFile, FiLink, FiX } from 'react-icons/fi';
import { uploadPaper, bulkUploadPapers, importFromDOI } from '../../api/paperApi';

function PaperUpload({ workspaceId, onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [doi, setDoi] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState('file');
    const [message, setMessage] = useState('');

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
                response = await bulkUploadPapers(workspaceId, files);
            } else {
                response = await uploadPaper(workspaceId, files[0]);
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

    const handleDOIUpload = async () => {
        if (!doi) return;
        setIsUploading(true);
        setMessage('');

        try {
            const response = await importFromDOI(workspaceId, doi);
            setMessage(`✅ ${response.message}`);
            setDoi('');
            if (onUploadComplete) onUploadComplete(response);
        } catch (error) {
            setMessage(`❌ DOI import failed: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="paper-upload">
            <h3>📄 Add Research Paper</h3>
            
            <div className="upload-tabs">
                <button className={uploadType === 'file' ? 'active' : ''} onClick={() => { setUploadType('file'); setMessage(''); }}>
                    <FiUpload /> Upload
                </button>
                <button className={uploadType === 'bulk' ? 'active' : ''} onClick={() => { setUploadType('bulk'); setMessage(''); }}>
                    <FiFile /> Bulk
                </button>
                <button className={uploadType === 'doi' ? 'active' : ''} onClick={() => { setUploadType('doi'); setMessage(''); }}>
                    <FiLink /> DOI
                </button>
            </div>

            {uploadType === 'doi' ? (
                <div className="doi-input">
                    <input 
                        type="text" 
                        placeholder="Enter DOI (e.g., 10.1038/s41586-024-07000-0)"
                        value={doi}
                        onChange={(e) => setDoi(e.target.value)}
                    />
                    <button onClick={handleDOIUpload} disabled={!doi || isUploading}>
                        {isUploading ? 'Importing...' : 'Import'}
                    </button>
                </div>
            ) : (
                <div className="file-input">
                    <input type="file" accept=".pdf" multiple={uploadType === 'bulk'} onChange={handleFileChange} />
                    {files.length > 0 && (
                        <div className="file-info">
                            <span>{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                            <button onClick={() => setFiles([])}><FiX /></button>
                        </div>
                    )}
                    <button onClick={handleUpload} disabled={!files.length || isUploading}>
                        {isUploading ? 'Uploading...' : `Upload ${files.length > 1 ? 'All' : 'Paper'}`}
                    </button>
                </div>
            )}

            {message && <div className="upload-message">{message}</div>}
        </div>
    );
}

export default PaperUpload;
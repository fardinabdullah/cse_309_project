import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiUsers, FiGrid, FiX, FiAlertCircle } from "react-icons/fi";
import { createWorkspace, getWorkspaces, deleteWorkspace, updateWorkspace, getWorkspace } from "../api/workspaceApi";
import "../styles/workspace.css";

import PaperUpload from './papers/PaperUpload';
import PaperList from './papers/PaperList';
import PaperSearch from './papers/PaperSearch';
import PaperDashboard from './papers/PaperDashboard';
import PaperReader from './papers/PaperReader';
import "../styles/papers.css";

function WorkspaceManager() {
    const [workspaces, setWorkspaces] = useState([]);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showPapers, setShowPapers] = useState(false);
    
    const [showReader, setShowReader] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState(null);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const scrollToNotification = () => {
        setTimeout(() => {
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const loadWorkspaces = async () => {
        try {
            const data = await getWorkspaces();
            setWorkspaces(data || []);
        } catch (error) {
            console.log("LOAD WORKSPACE ERROR:", error);
            setWorkspaces([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const isDuplicateName = (name, excludeId = null) => {
        return workspaces.some(w => w.name.toLowerCase() === name.toLowerCase() && w._id !== excludeId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isDuplicateName(formData.name, editingId)) {
            const errorMsg = `A workspace named "${formData.name}" already exists. Please use a different name.`;
            setError(errorMsg);
            scrollToNotification();
            setTimeout(() => setError(""), 8000);
            return;
        }

        setLoading(true);

        try {
            if (editingId) {
                await updateWorkspace(editingId, formData);
                setSuccess("Workspace updated successfully");
                scrollToNotification();
            } else {
                await createWorkspace(formData);
                setSuccess("Workspace created successfully");
                scrollToNotification();
            }

            setEditingId(null);
            setFormData({ name: "", description: "" });
            await loadWorkspaces();
        } catch (error) {
            console.log("CREATE/UPDATE ERROR:", error);
            let errorMsg = "Failed to save workspace. Please try again.";
            if (error.response) {
                if (error.response.data && error.response.data.detail) {
                    errorMsg = error.response.data.detail;
                }
            } else if (error.request) {
                errorMsg = "No response from server. Please check your connection.";
            }
            setError(errorMsg);
            scrollToNotification();
        } finally {
            setLoading(false);
            setTimeout(() => {
                setSuccess("");
                setError("");
            }, 8000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this workspace?")) {
            return;
        }

        try {
            await deleteWorkspace(id);
            await loadWorkspaces();
            setSuccess("Workspace deleted successfully");
            scrollToNotification();
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.log("DELETE ERROR:", error);
            let errorMsg = "Failed to delete workspace.";
            if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            }
            setError(errorMsg);
            scrollToNotification();
            setTimeout(() => setError(""), 4000);
        }
    };

    const handleEdit = (workspace) => {
        setEditingId(workspace._id);
        setFormData({
            name: workspace.name,
            description: workspace.description
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", description: "" });
    };

    const handleWorkspaceClick = (workspace) => {
        setSelectedWorkspaceId(workspace._id);
        setSelectedWorkspace(workspace);
        setShowPapers(true);
        setShowReader(false);
        setSelectedPaper(null);
    };

    const handleBackToWorkspaces = () => {
        setShowPapers(false);
        setSelectedWorkspaceId(null);
        setSelectedWorkspace(null);
        setShowReader(false);
        setSelectedPaper(null);
    };

    const handlePaperUploadComplete = async () => {
        await loadWorkspaces();
        if (selectedWorkspaceId) {
            const updated = workspaces.find(w => w._id === selectedWorkspaceId);
            if (updated) {
                setSelectedWorkspace(updated);
            }
        }
    };

    const handlePaperDeleted = async () => {
        if (selectedWorkspaceId) {
            try {
                const response = await getWorkspace(selectedWorkspaceId);
                setSelectedWorkspace(response);
            } catch (error) {
                console.error('Error refreshing papers:', error);
            }
        }
    };

    // Handle clicking a paper to open the reader
    const handlePaperClick = (paper) => {
        console.log('Opening paper:', paper.title);
        setSelectedPaper(paper);
        setShowReader(true);
    };

    // Go back from reader to paper list
    const handleBackFromReader = () => {
        setShowReader(false);
        setSelectedPaper(null);
    };

    // 🔥 NEW: Handle topic click from Knowledge Map
    const handleTopicClick = (paperId) => {
        console.log('Topic clicked - Opening paper:', paperId);
        
        const papers = selectedWorkspace?.papers || [];
        const paper = papers.find(p => (p._id || p.file_id) === paperId);
        
        if (paper) {
            console.log('Found paper:', paper.title);
            setSelectedPaper(paper);
            setShowReader(true);
        } else {
            console.log('Paper not found with ID:', paperId);
            alert('Paper not found. It may have been deleted.');
        }
    };

    return (
        <div className="workspace-page">
            <div className="workspace-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="workspace-container">
                <header className="workspace-header">
                    <div className="header-left">
                        <div className="brand-badge">
                            <span className="dot"></span>
                            <span>Smart Workspace Manager</span>
                        </div>
                        <h1>
                            {showReader ? 'Reading Paper' : 
                             showPapers ? selectedWorkspace?.name || 'Papers' : 
                             'Your Workspaces'}
                        </h1>
                        <p className="subtitle">
                            {showReader ? selectedPaper?.title || 'Paper' :
                             showPapers ? `Manage research papers in "${selectedWorkspace?.name}"` :
                             'Manage your research and project workspaces efficiently'}
                        </p>
                    </div>
                    <div className="header-stats">
                        {!showPapers && !showReader && (
                            <div className="stat-card">
                                <span className="stat-number">{workspaces.length}</span>
                                <span className="stat-label">Total Workspaces</span>
                            </div>
                        )}
                        {showPapers && selectedWorkspace && !showReader && (
                            <div className="stat-card">
                                <span className="stat-number">{selectedWorkspace.papers?.length || 0}</span>
                                <span className="stat-label">Papers</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Error and Success Notifications */}
                {error && (
                    <div className="notification error" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        fontSize: '15px',
                        fontWeight: '500',
                        animation: 'slideDown 0.4s ease',
                        width: '100%'
                    }}>
                        <FiAlertCircle size={22} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{error}</span>
                        <button 
                            onClick={() => setError("")}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="notification success" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: '#6ee7b7',
                        fontSize: '15px',
                        fontWeight: '500',
                        animation: 'slideDown 0.4s ease',
                        width: '100%'
                    }}>
                        <FiGrid size={22} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{success}</span>
                        <button 
                            onClick={() => setSuccess("")}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6ee7b7',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = 'rgba(52, 211, 153, 0.2)'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                )}

                {/* Show Workspace Form (only when not viewing papers or reader) */}
                {!showPapers && !showReader && (
                    <div className="form-card">
                        <div className="form-header">
                            <h2>
                                {editingId ? (
                                    <><FiEdit2 className="icon" /> Update Workspace</>
                                ) : (
                                    <><FiPlus className="icon" /> Create New Workspace</>
                                )}
                            </h2>
                            {editingId && (
                                <button className="cancel-btn" onClick={cancelEdit}>
                                    <FiX /> Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Workspace Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter workspace name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <small className="helper-text">Workspace names must be unique for your account</small>
                            </div>

                            <div className="form-group">
                                <label>Description <span className="required">*</span></label>
                                <textarea
                                    name="description"
                                    placeholder="Enter workspace description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                />
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                <span className="btn-content">
                                    {loading ? (
                                        <><span className="spinner"></span> Saving...</>
                                    ) : editingId ? (
                                        "Update Workspace"
                                    ) : (
                                        "Create Workspace"
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                )}

                {/* Paper Reader View */}
                {showReader && selectedPaper && selectedWorkspaceId && (
                    <PaperReader 
                        paper={selectedPaper}
                        workspaceId={selectedWorkspaceId}
                        onBack={handleBackFromReader}
                    />
                )}

                {/* Paper Management View */}
                {showPapers && selectedWorkspaceId && !showReader && (
                    <>
                        <button 
                            onClick={handleBackToWorkspaces}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                marginBottom: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.3s',
                                fontFamily: 'Inter, sans-serif'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            Back to Workspaces
                        </button>

                        {/* 🔥 Pass onTopicClick to PaperDashboard */}
                        <PaperDashboard 
                            workspaceId={selectedWorkspaceId} 
                            onTopicClick={handleTopicClick}
                        />

                        <PaperUpload 
                            workspaceId={selectedWorkspaceId} 
                            onUploadComplete={handlePaperUploadComplete}
                        />

                        <PaperSearch workspaceId={selectedWorkspaceId} />

                        <PaperList 
                            papers={selectedWorkspace?.papers || []} 
                            workspaceId={selectedWorkspaceId}
                            onPaperDeleted={handlePaperDeleted}
                            onPaperClick={handlePaperClick}
                        />
                    </>
                )}

                {/* Workspace List (only when not viewing papers or reader) */}
                {!showPapers && !showReader && (
                    <div className="workspace-list">
                        <div className="list-header">
                            <h2>All Workspaces</h2>
                            <span className="workspace-count">{workspaces.length} workspaces</span>
                        </div>

                        {workspaces.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><FiFolder size={48} /></div>
                                <h3>No workspaces yet</h3>
                                <p>Create your first workspace to get started</p>
                            </div>
                        ) : (
                            <div className="workspace-grid">
                                {workspaces.map((workspace) => (
                                    <div 
                                        key={workspace._id} 
                                        className="workspace-card"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleWorkspaceClick(workspace)}
                                    >
                                        <div className="card-header">
                                            <div className="card-icon">
                                                {workspace.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(workspace);
                                                    }}
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(workspace._id);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <h3>{workspace.name}</h3>
                                            <p>{workspace.description}</p>
                                            <small style={{ color: '#64748b', fontSize: '12px' }}>
                                                Papers: {workspace.papers?.length || 0}
                                            </small>
                                        </div>

                                        <div className="card-footer">
                                            <span className="owner-tag">
                                                <FiUsers size={12} /> {workspace.owner_id || "Unknown Owner"}
                                            </span>
                                            <span className="workspace-id">
                                                ID: {workspace._id.slice(-8)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkspaceManager;
import { useEffect, useState } from 'react';
import { getDocumentDashboard } from '../../api/documentApi';

function DocumentDashboard({ workspaceId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (workspaceId) {
            fetchStats();
        }
    }, [workspaceId]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getDocumentDashboard(workspaceId);
            setStats(data);
        } catch (error) {
            console.error('Stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="doc-dashboard-loading">Loading statistics...</div>;
    }

    if (!stats || stats.stats?.total_documents === 0) {
        return (
            <div className="doc-dashboard-empty">
                <p>No documents uploaded</p>
                <p className="hint">Upload documents to see statistics</p>
            </div>
        );
    }

    const typeLabels = {
        'pdf': 'PDF',
        'word': 'Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'image': 'Image',
        'text': 'Text',
        'other': 'Other'
    };

    const docStats = stats.stats || {};

    return (
        <div className="document-dashboard">
            <h3>📊 Document Dashboard</h3>
            
            <div className="doc-stats-row">
                <div className="doc-stat-item">
                    <span className="stat-number">{docStats.total_documents || 0}</span>
                    <span className="stat-label">Total Documents</span>
                </div>
                <div className="doc-stat-item">
                    <span className="stat-number">{docStats.total_size_mb || 0}</span>
                    <span className="stat-label">Total Size (MB)</span>
                </div>
                <div className="doc-stat-item">
                    <span className="stat-number">{stats.recent_versions?.length || 0}</span>
                    <span className="stat-label">Recent Updates</span>
                </div>
            </div>

            {docStats.by_type && Object.keys(docStats.by_type).length > 0 && (
                <div className="doc-type-breakdown">
                    <h4>Documents by Type</h4>
                    <div className="doc-type-list">
                        {Object.entries(docStats.by_type).map(([type, count]) => (
                            <span key={type} className="doc-type-tag">
                                {typeLabels[type] || type}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {stats.recent_versions && stats.recent_versions.length > 0 && (
                <div className="doc-recent-updates">
                    <h4>Recent Updates</h4>
                    <div className="doc-recent-list">
                        {stats.recent_versions.map((item, index) => (
                            <div key={index} className="doc-recent-item">
                                <span className="doc-recent-name">{item.document_name}</span>
                                <span className="doc-recent-version">v{item.version?.version || 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentDashboard;
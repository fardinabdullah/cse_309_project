import { useEffect, useState } from 'react';
import { getPaperDashboard } from '../../api/paperApi';

function PaperDashboard({ workspaceId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (workspaceId) {
            fetchDashboard();
        }
    }, [workspaceId]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const data = await getPaperDashboard(workspaceId);
            setStats(data);
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading statistics...</div>;
    }

    if (!stats || stats.total_papers === 0) {
        return (
            <div className="dashboard-empty">
                <p>📊 No papers to analyze yet</p>
                <p>Upload papers to see statistics</p>
            </div>
        );
    }

    return (
        <div className="paper-dashboard">
            <h3>📊 Paper Dashboard</h3>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-number">{stats.total_papers}</span>
                    <span className="stat-label">Total Papers</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{Object.keys(stats.papers_by_year || {}).length}</span>
                    <span className="stat-label">Years Covered</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{Object.keys(stats.papers_by_topic || {}).length}</span>
                    <span className="stat-label">Topics</span>
                </div>
            </div>

            {stats.papers_by_year && Object.keys(stats.papers_by_year).length > 0 && (
                <div className="year-breakdown">
                    <h4>📅 Papers by Year</h4>
                    <div className="year-list">
                        {Object.entries(stats.papers_by_year)
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .map(([year, count]) => (
                                <div key={year} className="year-item">
                                    <span>{year}</span>
                                    <span className="year-count">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {stats.most_read_authors && stats.most_read_authors.length > 0 && (
                <div className="author-breakdown">
                    <h4>✍️ Most Read Authors</h4>
                    <div className="author-list">
                        {stats.most_read_authors.map(([author, count]) => (
                            <div key={author} className="author-item">
                                <span>{author}</span>
                                <span className="author-count">{count} paper{count > 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaperDashboard;
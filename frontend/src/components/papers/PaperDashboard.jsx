import { useEffect, useState } from 'react';
import { getPaperDashboard } from '../../api/paperApi';
import { TOPICS_URL } from '../../api/config';

function PaperDashboard({ workspaceId, onTopicClick }) {
    const [stats, setStats] = useState(null);
    const [topics, setTopics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);

    useEffect(() => {
        if (workspaceId) {
            fetchDashboard();
            fetchTopics();
        }
    }, [workspaceId]);

    const fetchDashboard = async () => {
        try {
            const data = await getPaperDashboard(workspaceId);
            setStats(data);
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await fetch(`${TOPICS_URL}/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setTopics(data);
        } catch (error) {
            console.error('Topics error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTopicCount = (category) => {
        if (!topics) return 0;
        return Object.keys(topics[category] || {}).length;
    };

    const getTopicList = (category) => {
        if (!topics) return [];
        return Object.keys(topics[category] || {});
    };

    const getPapersForTopic = (category, topicName) => {
        if (!topics || !topics[category]) return [];
        const topicData = topics[category][topicName];
        return topicData?.papers || [];
    };

    const toggleCategory = (category) => {
        if (expandedCategory === category) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category);
        }
    };

    // 🔥 Handle paper click - Pass the paper ID up to parent
    const handlePaperClick = (paperId) => {
        if (onTopicClick) {
            onTopicClick(paperId);
        } else {
            alert('Opening paper: ' + paperId);
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading statistics...</div>;
    }

    if (!stats || stats.total_papers === 0) {
        return (
            <div className="dashboard-empty">
                <p>No papers to analyze yet</p>
                <p>Upload papers to see statistics</p>
            </div>
        );
    }

    const hardCount = getTopicCount('hard');
    const moderateCount = getTopicCount('moderate');
    const easyCount = getTopicCount('easy');
    const totalTopics = hardCount + moderateCount + easyCount;

    const renderTopicList = (category, label, icon) => {
        const topicsList = getTopicList(category);
        if (topicsList.length === 0) return null;

        return (
            <div className="topic-category-list">
                <div 
                    className="topic-category-header"
                    onClick={() => toggleCategory(category)}
                >
                    <span>{icon} {label} ({topicsList.length})</span>
                    <span className="expand-icon">
                        {expandedCategory === category ? '▼' : '▶'}
                    </span>
                </div>
                {expandedCategory === category && (
                    <div className="topic-items">
                        {topicsList.map((topicName) => {
                            const papers = getPapersForTopic(category, topicName);
                            return (
                                <div key={topicName} className="topic-item-group">
                                    <div className="topic-item-name">{topicName}</div>
                                    {papers.map((paper) => (
                                        <div 
                                            key={paper.id} 
                                            className="topic-paper-link"
                                            onClick={() => handlePaperClick(paper.id)}
                                        >
                                            <span className="paper-link-icon">📄</span>
                                            <span className="paper-link-title">{paper.title}</span>
                                            <span className="paper-link-action">→ Open</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="paper-dashboard">
            <h3>Paper Dashboard</h3>

            <div className="dashboard-two-col">
                {/* Left Column - Stats */}
                <div className="dashboard-left">
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span className="stat-number">{stats.total_papers}</span>
                            <span className="stat-label">Total Papers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{Object.keys(stats.papers_by_year || {}).length}</span>
                            <span className="stat-label">Years Covered</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{Object.keys(stats.papers_by_topic || {}).length}</span>
                            <span className="stat-label">Topics</span>
                        </div>
                    </div>

                    <div className="dashboard-breakdown">
                        {stats.papers_by_year && Object.keys(stats.papers_by_year).length > 0 && (
                            <div>
                                <h4>Papers by Year</h4>
                                <div className="breakdown-tag-list">
                                    {Object.entries(stats.papers_by_year)
                                        .sort((a, b) => b[0].localeCompare(a[0]))
                                        .map(([year, count]) => (
                                            <span key={year} className="breakdown-tag">
                                                {year} <span className="tag-count">{count}</span>
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        {stats.most_read_authors && stats.most_read_authors.length > 0 && (
                            <div>
                                <h4>Most Read Authors</h4>
                                <div className="breakdown-tag-list">
                                    {stats.most_read_authors.map(([author, count]) => (
                                        <span key={author} className="breakdown-tag">
                                            {author} <span className="tag-count">{count} paper{count > 1 ? 's' : ''}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Topics */}
                <div className="dashboard-right">
                    <div className="topics-summary">
                        <h4>Your Knowledge Map</h4>
                        {totalTopics > 0 ? (
                            <>
                                <div className="topic-stat-item hard" onClick={() => toggleCategory('hard')}>
                                    <span className="topic-dot">🔴</span>
                                    <span className="topic-label">Hard</span>
                                    <span className="topic-count">{hardCount}</span>
                                </div>
                                <div className="topic-stat-item moderate" onClick={() => toggleCategory('moderate')}>
                                    <span className="topic-dot">🟡</span>
                                    <span className="topic-label">Moderate</span>
                                    <span className="topic-count">{moderateCount}</span>
                                </div>
                                <div className="topic-stat-item easy" onClick={() => toggleCategory('easy')}>
                                    <span className="topic-dot">🟢</span>
                                    <span className="topic-label">Easy</span>
                                    <span className="topic-count">{easyCount}</span>
                                </div>

                                {/* 🔥 Expanded Topic Lists with Paper Links */}
                                {renderTopicList('hard', 'Hard', '🔴')}
                                {renderTopicList('moderate', 'Moderate', '🟡')}
                                {renderTopicList('easy', 'Easy', '🟢')}
                            </>
                        ) : (
                            <div className="topics-empty">
                                <p>No topics rated yet</p>
                                <p className="hint">Rate topics while reading papers</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaperDashboard;
import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronDown, FiMove, FiBookOpen, FiSearch } from 'react-icons/fi';

function TopicCategories({ workspaceId, onPaperOpen }) {
    const [topics, setTopics] = useState({ hard: {}, moderate: {}, easy: {} });
    const [loading, setLoading] = useState(true);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchTopics();
        fetchSummary();
    }, []);

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/topics/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setTopics(data);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await fetch('/topics/summary', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const toggleExpand = (category, topic) => {
        const key = `${category}-${topic}`;
        setExpandedTopics(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleMoveTopic = async (topic, fromCategory, toCategory) => {
        if (!window.confirm(`Move "${topic}" from ${fromCategory} to ${toCategory}?`)) return;
        
        try {
            const response = await fetch(
                `/topics/move?topic=${encodeURIComponent(topic)}&from_category=${fromCategory}&to_category=${toCategory}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const data = await response.json();
            alert(data.message);
            fetchTopics();
            fetchSummary();
        } catch (error) {
            console.error('Error moving topic:', error);
            alert('Failed to move topic');
        }
    };

    const renderCategory = (category, label, color, icon) => {
        const topicsList = topics[category] || {};
        const topicNames = Object.keys(topicsList);
        
        if (topicNames.length === 0) {
            return (
                <div className="category-empty">
                    <p>{icon} No {label.toLowerCase()} topics yet</p>
                    <p className="hint">Mark topics as {label.toLowerCase()} when reading papers</p>
                </div>
            );
        }

        return (
            <div className={`topic-category ${category}`}>
                <h3>{icon} {label} Topics ({topicNames.length})</h3>
                <p className="category-hint">
                    {category === 'hard' && 'You struggle with these. Keep practicing!'}
                    {category === 'moderate' && 'Getting better! Keep going.'}
                    {category === 'easy' && 'Your strengths! You are an expert here.'}
                </p>
                
                {topicNames.map((topic) => {
                    const topicData = topicsList[topic];
                    const papers = topicData?.papers || [];
                    const isExpanded = expandedTopics[`${category}-${topic}`];
                    const section = topicData?.section || '';
                    
                    return (
                        <div key={topic} className="topic-item">
                            <div 
                                className="topic-header"
                                onClick={() => toggleExpand(category, topic)}
                            >
                                <span className="topic-name">{topic}</span>
                                <span className="topic-count">{papers.length} papers</span>
                                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            
                            {isExpanded && (
                                <div className="topic-papers">
                                    {section && (
                                        <div className="topic-section-info">
                                            Found in: {section}
                                        </div>
                                    )}
                                    
                                    {papers.map((paper, i) => (
                                        <div 
                                            key={i} 
                                            className="paper-item"
                                            onClick={() => {
                                                if (onPaperOpen) {
                                                    onPaperOpen(paper.id);
                                                } else {
                                                    alert(`Opening: ${paper.title}`);
                                                }
                                            }}
                                        >
                                            <span className="paper-title">{paper.title}</span>
                                            <span className="paper-action">Open</span>
                                        </div>
                                    ))}
                                    
                                    <div className="topic-actions">
                                        <button className="review-btn">
                                            <FiBookOpen /> Review All
                                        </button>
                                        <button className="find-btn">
                                            <FiSearch /> Find More
                                        </button>
                                        {category === 'hard' && (
                                            <button 
                                                className="move-btn"
                                                onClick={() => handleMoveTopic(topic, category, 'moderate')}
                                            >
                                                <FiMove /> Move to Moderate
                                            </button>
                                        )}
                                        {category === 'moderate' && (
                                            <button 
                                                className="move-btn"
                                                onClick={() => handleMoveTopic(topic, category, 'easy')}
                                            >
                                                <FiMove /> Move to Easy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <div className="topics-loading">Loading your topics...</div>;
    }

    return (
        <div className="topic-categories">
            <div className="page-header">
                <h2>Your Topics by Difficulty</h2>
                <p className="page-subtitle">Organized by what you find Hard, Moderate, or Easy</p>
                {summary && (
                    <div className="summary-badges">
                        <span className="badge hard-badge">Hard: {summary.hard_count}</span>
                        <span className="badge moderate-badge">Moderate: {summary.moderate_count}</span>
                        <span className="badge easy-badge">Easy: {summary.easy_count}</span>
                        <span className="badge total-badge">Total: {summary.total_topics}</span>
                    </div>
                )}
                {summary && summary.message && (
                    <div className="motivational-message">
                        {summary.message}
                    </div>
                )}
            </div>

            {renderCategory('hard', 'Hard', '#f87171', 'Red')}
            {renderCategory('moderate', 'Moderate', '#fbbf24', 'Yellow')}
            {renderCategory('easy', 'Easy', '#34d399', 'Green')}
        </div>
    );
}

export default TopicCategories;
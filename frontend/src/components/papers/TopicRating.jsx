import { useState } from 'react';
import { FiThumbsUp, FiMeh, FiThumbsDown, FiStar } from 'react-icons/fi';

function TopicRating({ paperId, workspaceId, section, onRated, paperTitle }) {
    const [isLoading, setIsLoading] = useState(false);
    const [ratingMessage, setRatingMessage] = useState('');
    const [selected, setSelected] = useState(null);
    const [topicName, setTopicName] = useState('');

    const handleRate = async (category) => {
        if (!topicName.trim()) {
            alert('Please enter a topic name');
            return;
        }

        setIsLoading(true);
        setSelected(category);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/topics/add?topic=${encodeURIComponent(topicName)}&category=${category}&paper_id=${paperId}&section=${encodeURIComponent(section)}&workspace_id=${workspaceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                alert('Error: ' + (data.detail || 'Unknown error'));
                return;
            }
            
            setRatingMessage(data.message);
            alert(`✅ Topic "${topicName}" marked as ${category.toUpperCase()} in "${paperTitle}"`);
            
            setTimeout(() => {
                if (onRated) onRated(data);
            }, 1000);
        } catch (error) {
            console.error('Error rating:', error);
            alert('Failed to rate topic: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="topic-rating">
            <h4>How was this section for you?</h4>
            <p className="rating-subtitle">
                Mark topics as New, Hard, Moderate, or Easy to track your progress
            </p>

            <div className="topic-input">
                <input 
                    type="text" 
                    placeholder="Enter topic name (e.g., MCMC, Statistics)"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="topic-name-input"
                />
            </div>

            <div className="rating-buttons">
                <button 
                    className={`rating-btn new ${selected === 'new' ? 'selected' : ''}`}
                    onClick={() => handleRate('new')}
                    disabled={isLoading}
                >
                    <FiStar /> New Topic
                </button>
                <button 
                    className={`rating-btn hard ${selected === 'hard' ? 'selected' : ''}`}
                    onClick={() => handleRate('hard')}
                    disabled={isLoading}
                >
                    <FiThumbsDown /> Hard
                </button>
                <button 
                    className={`rating-btn moderate ${selected === 'moderate' ? 'selected' : ''}`}
                    onClick={() => handleRate('moderate')}
                    disabled={isLoading}
                >
                    <FiMeh /> Moderate
                </button>
                <button 
                    className={`rating-btn easy ${selected === 'easy' ? 'selected' : ''}`}
                    onClick={() => handleRate('easy')}
                    disabled={isLoading}
                >
                    <FiThumbsUp /> Easy
                </button>
            </div>

            {ratingMessage && (
                <div className="rating-message">
                    <span className="message-icon">✅</span>
                    <span>{ratingMessage}</span>
                </div>
            )}
        </div>
    );
}

export default TopicRating;
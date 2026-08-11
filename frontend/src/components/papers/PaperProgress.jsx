import { FiBook, FiClock, FiCalendar, FiBarChart2 } from 'react-icons/fi';

function PaperProgress({ progress, sections }) {
    if (!progress) {
        return <div className="progress-loading">Loading progress...</div>;
    }

    const getDifficultyColor = (difficulty) => {
        if (difficulty === 'hard') return '#f87171';
        if (difficulty === 'moderate') return '#fbbf24';
        return '#34d399';
    };

    const getDifficultyLabel = (difficulty) => {
        if (difficulty === 'hard') return 'Hard';
        if (difficulty === 'moderate') return 'Moderate';
        return 'Easy';
    };

    return (
        <div className="paper-progress">
            <div className="progress-card">
                <h3>Reading Progress</h3>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress.progress_percentage || 0}%` }}
                    ></div>
                </div>
                <div className="progress-stats">
                    <span><FiBook /> Page {progress.current_page || 0} of {progress.total_pages || 0}</span>
                    <span><FiBarChart2 /> {progress.progress_percentage || 0}% Complete</span>
                    <span><FiClock /> {progress.reading_time || 0} min spent</span>
                    <span><FiCalendar /> Last read: {progress.last_read || 'Never'}</span>
                </div>
            </div>

            <div className="sections-card">
                <h3>Sections</h3>
                {sections && sections.length > 0 ? (
                    <div className="sections-list">
                        {sections.map((section, index) => (
                            <div key={index} className="section-item">
                                <span className="section-status">
                                    {section.is_completed ? 'Complete' : 'Not Started'}
                                </span>
                                <span className="section-name">{section.name}</span>
                                <span 
                                    className="section-difficulty"
                                    style={{ 
                                        color: getDifficultyColor(section.difficulty),
                                        borderColor: getDifficultyColor(section.difficulty)
                                    }}
                                >
                                    {getDifficultyLabel(section.difficulty)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-sections">No sections detected</p>
                )}
            </div>
        </div>
    );
}

export default PaperProgress;
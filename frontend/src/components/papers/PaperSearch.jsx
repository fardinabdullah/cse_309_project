import { useState } from 'react';
import { FiSearch, FiFile, FiExternalLink } from 'react-icons/fi';
import { searchPapers } from '../../api/paperApi';
import { PAPERS_URL } from '../../api/config';

function PaperSearch({ workspaceId }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);

        try {
            const data = await searchPapers(workspaceId, query);
            setResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleViewPDF = (paperId) => {
        if (!paperId) {
            alert('Paper ID not found');
            return;
        }
        const url = `${PAPERS_URL}/view/${paperId}?workspace_id=${workspaceId}`;
        window.open(url, '_blank');
    };

    return (
        <div className="paper-search">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search inside ALL papers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={isSearching}>
                    <FiSearch /> {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {hasSearched && (
                <div className="search-results">
                    {isSearching ? (
                        <p>Searching...</p>
                    ) : results.length > 0 ? (
                        <>
                            <p className="result-count">Found {results.length} papers matching "{query}"</p>
                            {results.map((result, i) => (
                                <div key={i} className="result-item">
                                    <h4 
                                        style={{ 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            color: '#60a5fa'
                                        }}
                                        onClick={() => handleViewPDF(result.paper_id)}
                                    >
                                        <FiFile /> {result.paper_title}
                                        <span style={{ fontSize: '12px', color: '#3b82f6' }}>
                                            <FiExternalLink /> Click to read PDF
                                        </span>
                                    </h4>
                                    {result.matches.slice(0, 3).map((match, j) => (
                                        <p key={j} className="match-text">
                                            📄 Page {match.page}: {match.text?.substring(0, 200)}...
                                        </p>
                                    ))}
                                    {result.matches.length > 3 && (
                                        <p className="more-matches">+ {result.matches.length - 3} more matches</p>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="no-results">No results found for "{query}"</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PaperSearch;
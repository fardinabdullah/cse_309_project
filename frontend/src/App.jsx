import { useState } from "react";
import WorkspaceManager from "./components/WorkspaceManager";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );
    const [page, setPage] = useState(
        localStorage.getItem("token")
            ? "workspace"
            : "login"
    );

    const handleLogin = () => {
        setIsLoggedIn(true);
        setPage("workspace");
    };

    const handleSwitchToSignup = () => {
        setPage("signup");
    };

    const handleSwitchToLogin = () => {
        setPage("login");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setPage("login");
    };

    // If logged in - show navigation + workspace
    if (isLoggedIn) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                background: '#0a0a0f'
            }}>
                <nav style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 24px',
                    background: 'rgba(18,18,30,0.9)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    flexShrink: 0
                }}>
                    <span style={{ 
                        color: 'white', 
                        fontWeight: '600',
                        fontSize: '16px'
                    }}>
                        🚀 Smart Workspace
                    </span>
                    <button 
                        onClick={logout}
                        style={{
                            padding: '8px 20px',
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239,68,68,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239,68,68,0.2)';
                        }}
                    >
                        Logout
                    </button>
                </nav>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <WorkspaceManager />
                </div>
            </div>
        );
    }

    // If not logged in - show full screen login/signup
    if (page === "login") {
        return <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />;
    }

    if (page === "signup") {
        return <Signup onSwitchToLogin={handleSwitchToLogin} />;
    }

    return null;
}

export default App;
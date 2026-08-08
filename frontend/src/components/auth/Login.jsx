import { useState } from "react";
import axios from "axios";
import { 
    FiFolder, 
    FiZap, 
    FiUsers, 
    FiEye, 
    FiEyeOff,
    FiAlertCircle,
    FiArrowRight
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import "../../styles/login.css";

function Login({ onLogin, onSwitchToSignup }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.access_token);

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }

            setLoading(false);

            if (onLogin) {
                onLogin();
            }
        } catch (error) {
            console.log(error);
            setError("Invalid email or password");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="grid-pattern"></div>

            {/* LEFT - Branding Section */}
            <div className="login-brand">
                <div className="brand-badge">
                    <span className="dot"></span>
                    <span>Smart Workspace Manager</span>
                </div>

                <h1>Smart Workspace Manager</h1>

                <p className="tagline">
                    Organize your research, projects and ideas in a single, powerful workspace.
                </p>

                <div className="features">
                    <div className="feature-item">
                        <span className="icon blue"><FiFolder size={18} /></span>
                        <span>
                            <strong>Workspace Management</strong> — Create and organize projects
                        </span>
                    </div>
                    <div className="feature-item">
                        <span className="icon purple"><FiZap size={18} /></span>
                        <span>
                            <strong>AI-Powered</strong> — Smart insights and automation
                        </span>
                    </div>
                    <div className="feature-item">
                        <span className="icon green"><FiUsers size={18} /></span>
                        <span>
                            <strong>Team Collaboration</strong> — Work together seamlessly
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT - Login Card */}
            <div className="login-card">
                <div className="card-header">
                    <div className="greeting">WELCOME BACK</div>
                    <h2>Login to your account</h2>
                    <p className="subtitle">Continue managing your workspaces</p>
                </div>

                {error && (
                    <div className="error-message">
                        <FiAlertCircle className="error-icon" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            Password <span className="required">*</span>
                        </label>
                        <div className="password-box">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="show-btn"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                        <a href="#" className="forgot-link">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        <span className="btn-content">
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login <FiArrowRight />
                                </>
                            )}
                        </span>
                    </button>
                </form>

                <div className="divider">
                    <span>OR CONTINUE WITH</span>
                </div>

                <div className="social-buttons">
                    <button className="social-btn">
                        <FcGoogle size={20} />
                        Google
                    </button>
                    <button className="social-btn">
                        <FaGithub size={20} />
                        GitHub
                    </button>
                </div>

                <p className="signup-link">
                    Don't have an account?{" "}
                    <span 
                        className="signup-text"
                        onClick={() => {
                            if (onSwitchToSignup) {
                                onSwitchToSignup();
                            }
                        }}
                    >
                        Sign up now
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;
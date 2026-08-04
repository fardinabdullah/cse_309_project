import { useState } from "react";
import axios from "axios";
import { 
    FiUser, 
    FiMail, 
    FiLock, 
    FiAlertCircle,
    FiEye,
    FiEyeOff,
    FiArrowRight
} from "react-icons/fi";
import "../../styles/login.css";

function Signup({ onSwitchToLogin }) {  // ← Only need this prop
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/auth/register",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }
            );

            setLoading(false);
            
            // After successful signup, switch to login
            if (onSwitchToLogin) {
                onSwitchToLogin();
            }

        } catch (error) {
            console.log(error);
            setError(error.response?.data?.detail || "Signup failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="grid-pattern"></div>

            <div className="login-brand">
                <div className="brand-badge">
                    <span className="dot"></span>
                    <span>Smart Workspace Manager</span>
                </div>

                <h1>Smart Workspace Manager</h1>
                <p className="tagline">
                    Join thousands of researchers and professionals 
                    organizing their work efficiently.
                </p>

                <div className="features">
                    <div className="feature-item">
                        <span className="icon blue"><FiUser size={18} /></span>
                        <span>
                            <strong>Free to start</strong> — No credit card required
                        </span>
                    </div>
                    <div className="feature-item">
                        <span className="icon purple"><FiZap size={18} /></span>
                        <span>
                            <strong>AI-Powered</strong> — Smart workspace management
                        </span>
                    </div>
                    <div className="feature-item">
                        <span className="icon green"><FiUsers size={18} /></span>
                        <span>
                            <strong>Team Ready</strong> — Collaborate with your team
                        </span>
                    </div>
                </div>
            </div>

            <div className="login-card">
                <div className="card-header">
                    <div className="greeting">CREATE ACCOUNT</div>
                    <h2>Get started for free</h2>
                    <p className="subtitle">Join the Smart Workspace community</p>
                </div>

                {error && (
                    <div className="error-message">
                        <FiAlertCircle className="error-icon" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label>Full Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address <span className="required">*</span></label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password <span className="required">*</span></label>
                        <div className="password-box">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password (min 6 chars)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Confirm Password <span className="required">*</span></label>
                        <div className="password-box">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        <span className="btn-content">
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account <FiArrowRight />
                                </>
                            )}
                        </span>
                    </button>
                </form>

                <p className="signup-link">
                    Already have an account?{" "}
                    <span 
                        className="signup-text"
                        onClick={() => {
                            if (onSwitchToLogin) {
                                onSwitchToLogin();
                            }
                        }}
                    >
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Signup;
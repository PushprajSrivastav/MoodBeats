import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import '../styles/auth.scss';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { handleLogin, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="auth-layout">
      <div className="auth-sidebar">
        <div className="sidebar-content">
          <div className="logo">MoodBeats</div>
          <h1>Feel the Music,<br/>Literally.</h1>
          <p>Join thousands of users who let their emotions curate their daily listening experience.</p>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="brand-mobile">MoodBeats</div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue your journey</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="hello@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? 
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
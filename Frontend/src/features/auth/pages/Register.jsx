import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import '../styles/auth.scss';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(email, password, username);
    if (success) {
      navigate("/login");
    }
  };  

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
          <h2>Create Account</h2>
          <p className="subtitle">Sign up and start streaming your mood</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="name" 
                  placeholder="John Doe" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
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
              Create Account
            </button>
          </form>

          <div className="auth-link">
            Already have an account? 
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register;
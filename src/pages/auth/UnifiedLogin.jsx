import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, Key } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';
import toast from 'react-hot-toast';

const UnifiedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await authService.login(email, password);
      toast.success('Login successful!');
      
      // Automatically route to the correct dashboard based on role
      switch (user.role) {
        case 'patient':
          navigate('/patient');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'receptionist':
          navigate('/receptionist');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up">
        <div className="auth-sidebar" style={{background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'}}>
          <div className="logo" style={{ marginBottom: '30px', color: 'white' }}>
            <div className="icon" style={{background: 'rgba(255,255,255,0.2)'}}><Heart color="white" size={18} /></div>
            <h1 style={{color: 'white', WebkitTextFillColor: 'white'}}>CareConnect</h1>
          </div>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
            A single, unified portal for patients, doctors, and hospital staff. The system will automatically direct you to your specific dashboard.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <Shield size={20} color="rgba(255,255,255,0.8)" />
            <Activity size={20} color="rgba(255,255,255,0.8)" />
            <Key size={20} color="rgba(255,255,255,0.8)" />
          </div>
        </div>
        
        <div className="auth-form-area">
          <h2 style={{ marginBottom: '8px' }}>Sign In</h2>
          <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px' }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin}>
            {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14}/> {error}</div>}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;

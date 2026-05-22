import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';
import toast from 'react-hot-toast';

const UnifiedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login(email, password);

      if (rememberMe) {
        localStorage.setItem('cc_remember_email', email);
      } else {
        localStorage.removeItem('cc_remember_email');
      }

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

  // Pre-fill email if remembered
  React.useEffect(() => {
    const remembered = localStorage.getItem('cc_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '13px', color: '#6B7280', cursor: 'pointer' }}>
                Remember my email
              </label>
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

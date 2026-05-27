import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      // Always show success message to prevent email enumeration
      setSubmitted(true);
      toast.success('If this email exists, a reset link has been sent.');
    } catch (err) {
      // Still show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up" style={{ maxWidth: '700px' }}>
        <div className="auth-sidebar" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
          <div className="logo" style={{ marginBottom: '30px', color: 'white' }}>
            <div className="icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Heart color="white" size={18} />
            </div>
            <h1 style={{ color: 'white', WebkitTextFillColor: 'white' }}>CareConnect</h1>
          </div>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Account Recovery</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
            Enter your registered email address. We will send you a secure link to reset your password.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <Shield size={20} color="rgba(255,255,255,0.8)" />
            <Mail size={20} color="rgba(255,255,255,0.8)" />
          </div>
        </div>

        <div className="auth-form-area">
          {!submitted ? (
            <>
              <h2 style={{ marginBottom: '8px' }}>Forgot Password</h2>
              <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px' }}>
                We'll send a password reset link to your email address.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '42px' }}
                    />
                    <Mail
                      size={16}
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-auth" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#d1fae5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
                If <strong>{email}</strong> is registered with CareConnect, you will receive a password reset link shortly. Please check your inbox and spam folder.
              </p>
              <p style={{ color: '#6B7280', fontSize: '13px' }}>
                The link will expire in <strong>15 minutes</strong>.
              </p>
            </div>
          )}

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

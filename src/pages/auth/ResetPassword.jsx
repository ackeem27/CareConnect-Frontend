import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Shield, Eye, EyeOff, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';
import toast from 'react-hot-toast';

const getPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  return { score, checks, label: labels[score] || '', color: colors[score] || '' };
};

const PasswordCheck = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: ok ? '#10b981' : '#9ca3af' }}>
    {ok ? <CheckCircle size={11} /> : <XCircle size={11} />} {label}
  </div>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', passwordConfirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError('No reset token found. Please request a new password reset link.');
    if (form.password !== form.passwordConfirmation) return setError('Passwords do not match.');
    if (strength.score < 4) return setError('Password does not meet complexity requirements.');

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, form.password, form.passwordConfirmation);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
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
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Set New Password</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
            Choose a strong password that you haven't used before. Your new password must meet the complexity requirements shown on the right.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <Shield size={20} color="rgba(255,255,255,0.8)" />
            <Lock size={20} color="rgba(255,255,255,0.8)" />
          </div>
        </div>

        <div className="auth-form-area">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#d1fae5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h2 style={{ marginBottom: '12px' }}>Password Reset!</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                className="btn-auth"
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>
              <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px' }}>
                Enter your new password below.
              </p>

              {!token && (
                <div style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Invalid or missing reset link. Please request a new one.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={!token}
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {form.password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: i <= strength.score ? strength.color : '#e5e7eb',
                            transition: 'background 0.3s'
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
                        <PasswordCheck ok={strength.checks.length} label="8+ characters" />
                        <PasswordCheck ok={strength.checks.uppercase} label="Uppercase letter" />
                        <PasswordCheck ok={strength.checks.number} label="Number" />
                        <PasswordCheck ok={strength.checks.special} label="Special character" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-input"
                      name="passwordConfirmation"
                      value={form.passwordConfirmation}
                      onChange={handleChange}
                      required
                      disabled={!token}
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0' }}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.passwordConfirmation && form.password !== form.passwordConfirmation && (
                    <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Passwords do not match</p>
                  )}
                  {form.passwordConfirmation && form.password === form.passwordConfirmation && (
                    <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={11} /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-auth"
                  disabled={loading || !token}
                  style={{ marginTop: '8px' }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

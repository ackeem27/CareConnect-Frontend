import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';

const EmailVerification = ({ email: propEmail, role: propRole, onVerified }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Support both standalone route (via location.state) and inline component (via props)
  const email = propEmail || location.state?.email || '';
  const role  = propRole  || location.state?.role  || 'patient';
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyOtp(email, code);
      // Update stored user
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        currentUser.email_verified = true;
        localStorage.setItem('careconnect_active_user', JSON.stringify(currentUser));
      }
      
      if (onVerified) {
        onVerified();
      } else {
        // Default routing based on role
        const routes = {
          patient: '/patient',
          doctor: '/doctor',
          receptionist: '/receptionist',
          admin: '/admin'
        };
        navigate(routes[role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authService.resendOtp(email);
      setError(null);
      alert('Verification code resent to your email.');
    } catch (err) {
      setError('Failed to resend code.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up">
        <div className="auth-form-area" style={{ width: '100%', maxWidth: '450px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '64px', height: '64px', backgroundColor: '#eff6ff', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 20px' 
            }}>
              <Mail size={32} color="#3b82f6" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Verify Your Email</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              We've sent a 6-digit verification code to<br />
              <strong style={{ color: '#1e293b' }}>{email}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
            {otpCode.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                style={{
                  width: '45px', height: '55px', textAlign: 'center', 
                  fontSize: '20px', fontWeight: '600', borderRadius: '10px',
                  border: '2px solid #e2e8f0', backgroundColor: '#f8fafc',
                  outline: 'none', transition: 'all 0.2s'
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

          <button 
            className="btn-auth" 
            onClick={handleVerifyOtp} 
            disabled={isLoading}
            style={{ backgroundColor: '#3b82f6', width: '100%', padding: '12px', borderRadius: '10px', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isLoading ? <><Loader2 size={18} className="spin" /> Verifying...</> : 'Verify Email'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            Didn't receive the code?{' '}
            <button 
              onClick={handleResendOtp}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}
            >
              Resend Code
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

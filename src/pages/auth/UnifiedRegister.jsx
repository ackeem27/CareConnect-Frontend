import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Users, Stethoscope, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/dataService';
import '../../styles/auth/auth.css';
import toast from 'react-hot-toast';

const UnifiedRegister = () => {
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.passwordConfirmation) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      if (role === 'patient') {
        await authService.registerPatient({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
          phone: form.phone,
          date_of_birth: form.dateOfBirth
        });
        toast.success('Registration successful! Welcome to CareConnect.');
        navigate('/patient');
      } else {
        await authService.registerStaff({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
          phone: form.phone,
          role: role
        });
        toast.success('Registration successful! Please verify your email.');
        // Staff typically need to wait for approval or verify email, but we'll route them appropriately
        if (role === 'doctor') navigate('/doctor');
        else if (role === 'receptionist') navigate('/receptionist');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up" style={{maxWidth: '900px'}}>
        <div className="auth-sidebar" style={{background: 'linear-gradient(135deg, #2563eb, #4f46e5)'}}>
          <div className="logo" style={{ marginBottom: '30px', color: 'white' }}>
            <div className="icon" style={{background: 'rgba(255,255,255,0.2)'}}><Heart color="white" size={18} /></div>
            <h1 style={{color: 'white', WebkitTextFillColor: 'white'}}>CareConnect</h1>
          </div>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Join Our Network</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
            Select your account type to get started. Whether you're seeking care or providing it, our unified platform brings everyone together.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <Users size={20} color="rgba(255,255,255,0.8)" />
            <Stethoscope size={20} color="rgba(255,255,255,0.8)" />
          </div>
        </div>
        
        <div className="auth-form-area" style={{padding: '40px 50px'}}>
          <h2 style={{ marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '14px' }}>
            Fill in your details to register
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button 
              type="button"
              onClick={() => setRole('patient')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'patient' ? '2px solid #3b82f6' : '1px solid #e5e7eb', background: role === 'patient' ? '#eff6ff' : 'white', color: role === 'patient' ? '#1d4ed8' : '#4b5563', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Users size={16} /> Patient
            </button>
            <button 
              type="button"
              onClick={() => setRole('doctor')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'doctor' ? '2px solid #3b82f6' : '1px solid #e5e7eb', background: role === 'doctor' ? '#eff6ff' : 'white', color: role === 'doctor' ? '#1d4ed8' : '#4b5563', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Stethoscope size={16} /> Doctor
            </button>
            <button 
              type="button"
              onClick={() => setRole('receptionist')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'receptionist' ? '2px solid #3b82f6' : '1px solid #e5e7eb', background: role === 'receptionist' ? '#eff6ff' : 'white', color: role === 'receptionist' ? '#1d4ed8' : '#4b5563', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Activity size={16} /> Staff
            </button>
          </div>

          <form onSubmit={handleRegister}>
            {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14}/> {error}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" name="email" value={form.email} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              {role === 'patient' && (
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon-wrapper">
                  <div className="input-icon-left"><Lock size={18} /></div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input has-icon-left has-icon-right" 
                    placeholder="Password"
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon-wrapper">
                  <div className="input-icon-left"><Lock size={18} /></div>
                  <input 
                    type={showPasswordConfirmation ? "text" : "password"} 
                    className="form-input has-icon-left has-icon-right" 
                    placeholder="Password"
                    name="passwordConfirmation" 
                    value={form.passwordConfirmation} 
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-icon-right"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  >
                    {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;

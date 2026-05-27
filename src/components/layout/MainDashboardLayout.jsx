import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Stethoscope, Calendar, UserPlus, LogOut, 
  Search, Heart, FlaskConical, User, X, Camera, Lock, Shield
} from 'lucide-react';
import { authService } from '../../services/dataService';
import NotificationPanel from './NotificationPanel';
import toast from 'react-hot-toast';
import './MainDashboardLayout.css';

const MainDashboardLayout = ({ children, role: propRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = authService.getCurrentUser();
  const role = propRole || user?.role;

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    passwordConfirmation: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const isStaff = user.role && user.role !== 'patient';
  const isApproved = user.approved !== false || user.role === 'patient';

  const allMenuItems = [
    { id: 'queue', label: 'Priority Queue', icon: <Activity size={20} />, path: '/queue', roles: ['doctor'] },
    { id: 'queue-receptionist', label: 'Priority Queue', icon: <Activity size={20} />, path: '/receptionist?tab=queue', roles: ['receptionist'] },
    { id: 'doctor', label: 'Doctor Hub', icon: <Stethoscope size={20} />, path: '/doctor', roles: ['doctor'] },
    { id: 'schedule', label: 'Reception/Schedule', icon: <Calendar size={20} />, path: '/receptionist?tab=schedule', roles: ['receptionist'] },
    { id: 'walkin', label: 'Walk-in Registration', icon: <UserPlus size={20} />, path: '/receptionist?tab=walkin', roles: ['receptionist'] },
    { id: 'ai-eval', label: 'AI Evaluation', icon: <FlaskConical size={20} />, path: '/ai-evaluation', roles: ['admin'] },
    { id: 'lab', label: 'Lab Pathology', icon: <FlaskConical size={20} />, path: '/lab', roles: ['lab_technologist'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleSignOut = () => {
    authService.logout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('user[name]', profileForm.name);
      formData.append('user[phone]', profileForm.phone);
      if (profileForm.password) {
        formData.append('user[password]', profileForm.password);
        formData.append('user[password_confirmation]', profileForm.passwordConfirmation);
      }
      if (avatarFile) {
        formData.append('user[avatar]', avatarFile);
      }
      
      await authService.updateProfile(formData);
      toast.success("Profile updated successfully");
      setShowProfileModal(false);
      // Reset passwords
      setProfileForm(prev => ({ ...prev, password: '', passwordConfirmation: '' }));
      setAvatarFile(null);
      // refresh user in local storage to force update layout
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        setProfileForm(prev => ({ ...prev, name: updatedUser.name, phone: updatedUser.phone }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isStaff && !isApproved) {
    return (
      <div className="unapproved-screen" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px'
      }}>
        <div className="unapproved-card" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          color: 'white',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            color: '#ef4444'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Account Under Review</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
            Your staff account is currently pending approval by an administrator. You will gain access to the CareConnect clinic portal once your account has been approved.
          </p>
          <button onClick={handleSignOut} style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Get current avatar url
  const avatarUrl = user.avatar_url ? `http://localhost:3001${user.avatar_url}` : `https://ui-avatars.com/api/?background=random&color=fff&name=${user.name || 'Staff'}`;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/')}>
          <div className="brand-logo"><Heart color="white" size={18} fill="white" /></div>
          <span className="brand-name">CareConnect</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const currentFull = location.pathname + location.search;
            let isActive = false;
            if (item.id === 'queue-receptionist') {
              const tab = new URLSearchParams(location.search).get('tab');
              isActive = location.pathname === '/receptionist' && (!tab || tab === 'queue');
            } else if (item.id === 'schedule') {
              const tab = new URLSearchParams(location.search).get('tab');
              isActive = location.pathname === '/receptionist' && tab === 'schedule';
            } else {
              isActive = currentFull === item.path || 
                         (location.pathname === item.path && !location.search && !item.path.includes('?'));
            }
            return (
              <div 
                key={item.id} 
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="item-label">{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="signout-btn" onClick={handleSignOut}>
            <LogOut size={18} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="main-container">
        <header className="dashboard-header">
          <div className="header-left">
            <span className="emergency-info">Emergency Info</span>
          </div>
          <div className="header-right">
            <div className="header-search">
              <Search size={16} />
              <input type="text" placeholder="Search patients..." />
            </div>
            <NotificationPanel />
            <div className="header-profile" onClick={() => setShowProfileModal(true)} style={{cursor:'pointer'}}>
              <img src={avatarUrl} alt="Profile" />
            </div>
          </div>
        </header>

        <main className="content-area">{children}</main>

        <footer className="dashboard-footer-simple">
          <div className="footer-copyright">© 2026 CareConnect Systems. All rights reserved.</div>
          <div className="footer-links-simple">
            <span>Privacy Policy</span><span>Support Center</span><span>System Status</span>
          </div>
        </footer>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>Edit Profile Details</h3>
              <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="profile-modal-form">
              <div className="profile-avatar-upload">
                <div className="profile-avatar-preview">
                  <img src={avatarPreview || avatarUrl} alt="Preview" />
                  <label htmlFor="avatar-file-input" className="avatar-edit-badge">
                    <Camera size={14} color="white" />
                  </label>
                </div>
                <input 
                  id="avatar-file-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  style={{display:'none'}}
                />
                <span className="profile-upload-hint">Click camera to upload profile picture</span>
              </div>

              <div className="profile-form-group">
                <label><User size={14} /> Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="profile-form-group">
                <label><Activity size={14} /> Phone Number</label>
                <input 
                  type="text" 
                  value={profileForm.phone} 
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                />
              </div>

              <div className="profile-form-group">
                <label><Lock size={14} /> Change Password (optional)</label>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={profileForm.password} 
                  onChange={e => setProfileForm({...profileForm, password: e.target.value})} 
                />
              </div>

              <div className="profile-form-group">
                <label><Lock size={14} /> Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={profileForm.passwordConfirmation} 
                  onChange={e => setProfileForm({...profileForm, passwordConfirmation: e.target.value})} 
                />
              </div>

              <div className="profile-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={updating}>
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboardLayout;

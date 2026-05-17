import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Stethoscope, Calendar, UserPlus, LogOut, 
  Search, Heart, FlaskConical
} from 'lucide-react';
import { authService } from '../../services/dataService';
import NotificationPanel from './NotificationPanel';
import './MainDashboardLayout.css';

const MainDashboardLayout = ({ children, role: propRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = authService.getCurrentUser();
  const role = propRole || user?.role;
  
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const allMenuItems = [
    { id: 'queue', label: 'Priority Queue', icon: <Activity size={20} />, path: '/queue', roles: ['doctor'] },
    { id: 'queue-receptionist', label: 'Priority Queue', icon: <Activity size={20} />, path: '/receptionist?tab=queue', roles: ['receptionist'] },
    { id: 'doctor', label: 'Doctor Hub', icon: <Stethoscope size={20} />, path: '/doctor', roles: ['doctor'] },
    { id: 'schedule', label: 'Reception/Schedule', icon: <Calendar size={20} />, path: '/receptionist?tab=schedule', roles: ['receptionist'] },
    { id: 'walkin', label: 'Walk-in Registration', icon: <UserPlus size={20} />, path: '/receptionist?tab=walkin', roles: ['receptionist'] },
    { id: 'ai-eval', label: 'AI Evaluation', icon: <FlaskConical size={20} />, path: '/ai-evaluation', roles: ['admin', 'doctor', 'receptionist'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleSignOut = () => {
    authService.logout();
    navigate('/');
  };

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
            <div className="header-profile">
              <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${user.name || 'Staff'}`} alt="Profile" />
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
    </div>
  );
};

export default MainDashboardLayout;
// Persist sidebar state in localStorage

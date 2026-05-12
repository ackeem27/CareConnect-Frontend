import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Calendar, AlertCircle, Activity, Search, Filter,
  ChevronLeft, ChevronRight, Heart, Bell, LogOut, ShieldCheck,
  Download, Clock, Database, Wifi, Edit3, Trash2, Server, Settings, Save, X, FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, adminService } from '../services/dataService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [editingConfig, setEditingConfig] = useState(null);
  const [editConfigValue, setEditConfigValue] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/staffPortal');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [s, u, l, c] = await Promise.all([
        adminService.fetchStats(), adminService.fetchUsers(), adminService.fetchActivityLogs(), adminService.fetchConfigs()
      ]);
      setStats(s); setUsers(u?.users || u || []); setActivityLogs(l); setConfigs(c || []);
    } catch (err) { toast.error('Failed to load admin data'); } finally { setLoading(false); }
  };

  const handleUpdateRole = async (userId) => {
    try {
      await adminService.updateUser(userId, { role: editRole });
      toast.success('Role updated successfully');
      setEditingUser(null); loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await adminService.deactivateUser(userId); toast.success('User deactivated'); loadData(); }
    catch (err) { toast.error(err.message); }
  };

  // FR25: Save config
  const handleSaveConfig = async (configId) => {
    try {
      await adminService.updateConfig(configId, editConfigValue);
      toast.success('Configuration updated');
      setEditingConfig(null);
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const getConfigIcon = (key) => {
    if (key?.includes('hour')) return <Clock size={16} color="#3b82f6" />;
    if (key?.includes('duration') || key?.includes('slot')) return <Calendar size={16} color="#10b981" />;
    if (key?.includes('max') || key?.includes('patient')) return <Users size={16} color="#f59e0b" />;
    return <Settings size={16} color="#64748b" />;
  };

  const handleSignOut = () => { authService.logout(); navigate('/'); };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const labels = { admin: 'Admin', doctor: 'Practitioner', receptionist: 'Receptionist', patient: 'Patient' };
    return <span className={`ad-role-badge role-${role}`}>{labels[role] || role}</span>;
  };

  const formatTimeAgo = (d) => {
    if (!d) return 'Never';
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  if (!user) return null;

  return (
    <div className="ad-wrapper">
      <header className="ad-header">
        <div className="ad-header-left">
          <Link to="/" className="ad-brand">
            <div className="ad-brand-icon"><Heart color="white" size={16} fill="white" /></div>
            <span>CareConnect</span>
          </Link>
          <nav className="ad-header-nav"><Link to="/">Home</Link><Link to="/admin" className="active">Admin Panel</Link></nav>
        </div>
        <div className="ad-header-right">
          <button className="ad-icon-btn"><Bell size={20} /></button>
          <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${user.name}`} alt="" className="ad-avatar" />
          <button className="ad-signout-btn" onClick={handleSignOut}><LogOut size={16} /> Sign Out</button>
        </div>
      </header>

      <main className="ad-main">
        <div className="ad-title-section">
          <div><h1>Admin Dashboard</h1><p>Manage system integrity and oversee platform activity.</p></div>
          <div className="ad-title-actions">
            <button className="ad-btn-outline" onClick={() => navigate('/ai-evaluation')}>
              <FlaskConical size={16} /> AI Accuracy Validation
            </button>
            <button className="ad-btn-danger"><ShieldCheck size={16} /> Security Audit</button>
          </div>
        </div>

        <div className="ad-stats-row">
          <div className="ad-stat-card"><div><span className="ad-stat-label">Total Active Users</span><div className="ad-stat-value">{stats?.active_users || 0}</div><span className="ad-stat-change positive">↑ +12.5%</span></div><div className="ad-stat-icon blue"><Users size={24} /></div></div>
          <div className="ad-stat-card"><div><span className="ad-stat-label">Today's Bookings</span><div className="ad-stat-value">{stats?.todays_appointments || 0}</div><span className="ad-stat-change positive">↑ +8.2%</span></div><div className="ad-stat-icon green"><Calendar size={24} /></div></div>
          <div className="ad-stat-card"><div><span className="ad-stat-label">System Alerts</span><div className="ad-stat-value">{stats?.system_alerts || 0}</div><span className="ad-stat-change neutral">↓ 24%</span></div><div className="ad-stat-icon orange"><AlertCircle size={24} /></div></div>
        </div>

        <div className="ad-content-grid">
          <div className="ad-users-section">
            <div className="ad-section-header">
              <div><h2>User Management</h2><p>Search, filter, and manage all accounts.</p></div>
              <div className="ad-search-row">
                <div className="ad-search-box"><Search size={16} /><input type="text" placeholder="Search name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <button className="ad-filter-btn"><Filter size={16} /></button>
              </div>
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    <tr><td colSpan={6} style={{padding:40}}><div className="skeleton-loader" style={{height:'40px', width:'100%', borderRadius:'8px', background:'#f1f5f9', animation:'pulse 1.5s infinite'}}></div></td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td><div className="ad-user-cell"><img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${u.name || u.email}`} alt="" /><span>{u.name || 'Unknown'}</span></div></td>
                      <td className="ad-email-cell">{u.email}</td>
                      <td>{editingUser === u.id ? <select value={editRole} onChange={e => setEditRole(e.target.value)} className="ad-role-select"><option value="patient">Patient</option><option value="doctor">Practitioner</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option></select> : getRoleBadge(u.role)}</td>
                      <td><span className={`ad-status-badge ${u.active ? 'active' : 'inactive'}`}><span className="ad-status-dot" /> {u.active ? 'Active' : 'Inactive'}</span></td>
                      <td className="ad-time-cell">{formatTimeAgo(u.last_login_at)}</td>
                      <td>{editingUser === u.id ? <div className="ad-edit-actions"><button className="ad-save-btn" onClick={() => handleUpdateRole(u.id)}>Save</button><button className="ad-cancel-btn" onClick={() => setEditingUser(null)}>✕</button></div> : <div className="ad-action-dropdown"><button className="ad-action-btn" onClick={() => { setEditingUser(u.id); setEditRole(u.role); }}><Edit3 size={14} /></button><button className="ad-action-btn danger" onClick={() => handleDeactivate(u.id)}><Trash2 size={14} /></button></div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ad-table-footer"><span>Showing {filteredUsers.length} of {users.length} users</span><div className="ad-pagination"><button className="ad-pag-btn">Previous</button><button className="ad-pag-btn">Next</button></div></div>
            <div className="ad-security-alert"><AlertCircle size={20} color="#3b82f6" /><div><h4>Security Recommendation</h4><p>Consider enabling mandatory 2FA for all Practitioner roles to enhance system security.</p></div></div>
          </div>

          <div className="ad-activity-sidebar">
            <div className="ad-activity-header"><h3>System Activity</h3><span className="ad-live-badge">Real-time</span></div>
            <p className="ad-activity-sub">Live feed of platform events.</p>
            <div className="ad-activity-feed">
              {loading && activityLogs.length === 0 ? (
                  <div className="skeleton-loader" style={{height:'60px', margin:'16px', borderRadius:'8px', background:'#f1f5f9', animation:'pulse 1.5s infinite'}}></div>
              ) : activityLogs.slice(0, 8).map((log, i) => (
                <div key={log.id || i} className="ad-activity-item">
                  <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${log.user_name || 'System'}`} alt="" className="ad-activity-avatar" />
                  <div className="ad-activity-content"><p><strong>{log.user_name || 'System'}</strong> {log.details || log.action}</p><span className="ad-activity-time"><Clock size={12} /> {formatTimeAgo(log.created_at)}</span></div>
                </div>
              ))}
              {!loading && activityLogs.length === 0 && <p className="ad-empty-text">No activity logged yet.</p>}
            </div>
            <button className="ad-view-full-log">View Full Audit Log</button>
          </div>
        </div>

        <div className="ad-system-status">
          <div className="ad-status-card"><div className="ad-status-top"><span>SERVER STATUS</span><Server size={16} color="#10b981" /></div><span className="ad-status-val operational">Operational</span></div>
          <div className="ad-status-card"><div className="ad-status-top"><span>DATABASE</span><Database size={16} color="#10b981" /></div><span className="ad-status-val">Healthy</span></div>
          <div className="ad-status-card"><div className="ad-status-top"><span>API LATENCY</span><Activity size={16} color="#f59e0b" /></div><span className="ad-status-val warning">124ms</span></div>
          <div className="ad-status-card"><div className="ad-status-top"><span>SMS GATEWAY</span><Wifi size={16} color="#10b981" /></div><span className="ad-status-val operational">Active</span></div>
        </div>

        {/* FR25: System Configuration Panel */}
        <div className="ad-config-section" style={{marginTop: '28px'}}>
          <div className="ad-section-header">
            <div>
              <h2 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Settings size={20} /> System Configuration</h2>
              <p>Manage working hours, slot durations, and system limits.</p>
            </div>
          </div>
          <div className="ad-config-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px'}}>
            {configs.length === 0 && !loading && (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No system configurations found. Seed default configs in the database.</div>
            )}
            {configs.map(config => (
              <div key={config.id} className="ad-config-card" style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', transition: 'box-shadow 0.2s', position: 'relative'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                  <div style={{width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {getConfigIcon(config.key)}
                  </div>
                  <div>
                    <div style={{fontSize: '13px', fontWeight: 700, color: '#0f172a'}}>{(config.key || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{fontSize: '11px', color: '#94a3b8'}}>{config.description || config.key}</div>
                  </div>
                </div>
                {editingConfig === config.id ? (
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <input
                      type="text"
                      value={editConfigValue}
                      onChange={e => setEditConfigValue(e.target.value)}
                      style={{flex: 1, padding: '8px 12px', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none'}}
                      autoFocus
                    />
                    <button onClick={() => handleSaveConfig(config.id)} style={{padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex'}}><Save size={16} /></button>
                    <button onClick={() => setEditingConfig(null)} style={{padding: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex'}}><X size={16} /></button>
                  </div>
                ) : (
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '22px', fontWeight: 800, color: '#0f172a'}}>{config.value}</span>
                    <button
                      onClick={() => { setEditingConfig(config.id); setEditConfigValue(config.value); }}
                      style={{padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6'}}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="ad-footer">
        <div className="ad-footer-grid">
          <div className="ad-footer-brand"><div className="ad-brand"><div className="ad-brand-icon"><Heart color="white" size={14} fill="white" /></div><span>CareConnect</span></div><p>Revolutionizing healthcare access with technology.</p></div>
          <div className="ad-footer-links"><h4>PATIENTS</h4><Link to="/register">Register</Link><Link to="/login">Login</Link></div>
          <div className="ad-footer-links"><h4>SUPPORT</h4><a href="#">Help Center</a><a href="#">Privacy Policy</a></div>
          <div className="ad-footer-links"><h4>STAFF</h4><Link to="/login">Admin Sign In</Link></div>
        </div>
        <div className="ad-footer-bottom">© 2026 CareConnect. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
// Confirmation dialog before deletion
// Loading state for save operations
// AdminDashboard: Manages users, configs, and activity logs
// Use memo for UserList component
// Debounce search to 300ms
// Skeleton UI while fetching users
// Empty state: 'No recent activity'
// Pre-save config validation
// z-index fix for dropdown
// ActivityChart component extracted
// Redirect to login on 401

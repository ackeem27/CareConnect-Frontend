import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ChevronRight, 
  Clock, 
  Plus, 
  Activity,
  LogOut,
  History,
  CheckCircle2,
  AlertCircle,
  Info,
  Stethoscope,
  Pill,
  Heart,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, appointmentService, notificationService } from '../services/dataService';
import '../styles/PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedApptId, setExpandedApptId] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      navigate('/patientLogin');
      return;
    }
    setUser(currentUser);
    
    const loadData = async () => {
      try {
        const [apptData, notifData] = await Promise.all([
          appointmentService.fetchMyAppointments(),
          notificationService.fetchNotifications()
        ]);
        setAppointments(apptData);
        setNotifications(notifData.notifications || []);
      } catch (err) {
        console.error('Error loading patient data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSignOut = () => {
    authService.logout();
    navigate('/');
  };

  const getAlertIcon = (title) => {
    if (title.toLowerCase().includes('prescription') || title.toLowerCase().includes('pill')) return Pill;
    if (title.toLowerCase().includes('confirmed') || title.toLowerCase().includes('booked')) return CheckCircle2;
    if (title.toLowerCase().includes('reminder') || title.toLowerCase().includes('flu')) return AlertCircle;
    return Info;
  };

  if (!user) return null;

  return (
    <div className="pd-wrapper">
      {/* Top Nav */}
      <nav className="pd-nav">
        <div className="pd-nav-left">
          <div className="pd-brand">
            <Heart fill="#3b82f6" color="#3b82f6" size={24} />
            CareConnect
          </div>
          <div className="pd-nav-links">
            <Link to="/">Home</Link>
            <Link to="/patient" className="active">Dashboard</Link>
          </div>
        </div>
        <div className="pd-nav-right">
          <button className="pd-icon-btn">
            <Bell size={20} />
            <span className="pd-notif-dot"></span>
          </button>
          <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${user.name}`} alt="Profile" className="pd-avatar" />
          <button className="pd-signout" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      <main className="pd-main-content">
        {/* Header */}
        <header className="pd-header">
          <div className="pd-welcome">
            <h1>Welcome back, {user.name.split(' ')[0]}</h1>
            <p>You have {appointments.length} appointments scheduled for this week.</p>
          </div>
          <div className="pd-header-stats">
            <div className="pd-stat-pill">
              <div className="pd-stat-icon bg-blue-subtle">
                <History size={16} color="#3b82f6" />
              </div>
              <div className="pd-stat-text">
                <span className="pd-stat-label">PAST VISITS</span>
                <span className="pd-stat-val">{appointments.filter(a => a.status === 'completed').length}</span>
              </div>
            </div>
            <div className="pd-stat-pill">
              <div className="pd-stat-icon bg-green-subtle">
                <Plus size={16} color="#10b981" />
              </div>
              <div className="pd-stat-text">
                <span className="pd-stat-label">UNREAD</span>
                <span className="pd-stat-val">{notifications.filter(n => !n.read).length}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="pd-grid">
          <div className="pd-grid-main">
            {/* Intake Card */}
            <div className="pd-card pd-intake">
              <h2 className="pd-intake-title">
                <Activity size={20} color="#3b82f6" />
                How are you feeling today?
              </h2>
              
              {appointments.length > 0 ? (
                <>
                  <p className="pd-intake-desc">Your symptoms have been recorded and sent to our AI triage system.</p>
                  
                  <div className="pd-intake-success mt-4 mb-4" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px'}}>
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                      <div style={{fontWeight: 600, color: '#064e3b', fontSize: '0.95rem'}}>Symptoms Submitted</div>
                      <div style={{color: '#065f46', fontSize: '0.85rem'}}>You're currently in the Priority Queue.</div>
                    </div>
                  </div>

                  <div className="pd-intake-footer" style={{borderTop: 'none', paddingTop: 0, justifyContent: 'flex-start'}}>
                    <button className="pd-btn-outline" onClick={() => navigate('/intake')}>
                      Update or Retake Symptoms
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="pd-intake-desc">Record your symptoms to help your care team monitor your health and give you rapid AI guidance.</p>
                  
                  <div className="pd-intake-footer" style={{borderTop: 'none', paddingTop: '1rem'}}>
                    <button className="pd-btn-primary" onClick={() => navigate('/intake')} style={{width: '200px'}}>
                      Take Symptoms
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="pd-split">
              {/* My Appointments */}
              <div className="pd-appointments">
                <div className="pd-section-top">
                  <h3>My Appointments</h3>
                  <div className="pd-toggle">
                    <button className="active">Upcoming</button>
                    <button>Past</button>
                  </div>
                </div>
                <div className="pd-appt-list">
                    {appointments.length > 0 ? (
                      appointments.map((appt) => (
                        <div 
                          key={appt.id} 
                          className="pd-appt-card" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedApptId(expandedApptId === appt.id ? null : appt.id)}
                        >
                          <div className="pd-appt-avatar bg-gray-subtle">
                            <Stethoscope size={24} color="#64748b" />
                          </div>
                          <div className="pd-appt-info">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              AI Triage: 
                              <span style={{
                                color: appt.priority_level === 'HIGH' ? '#dc2626' : appt.priority_level === 'MEDIUM' ? '#d97706' : '#2563eb',
                                fontWeight: 800
                              }}>
                                {appt.priority_level}
                              </span>
                            </h4>
                            <p className="pd-appt-desc">Symptoms: {Array.isArray(appt.symptoms) ? appt.symptoms.join(', ') : appt.symptoms}</p>
                            <div className="pd-appt-meta">
                              <span><CalendarIcon /> {new Date(appt.created_at).toLocaleDateString()}</span>
                              <span><Clock size={12} /> {new Date(appt.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                          <div className="pd-appt-right">
                            <span className={`pd-badge-upcoming ${appt.status === 'completed' ? 'bg-green' : 'bg-blue'}`}>{appt.status.toUpperCase()}</span>
                            <ChevronRight 
                              size={20} 
                              color="#94a3b8" 
                              style={{ 
                                transform: expandedApptId === appt.id ? 'rotate(90deg)' : 'none',
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          </div>
                          
                          {expandedApptId === appt.id && (
                            <div className="pd-appt-triage-detail" onClick={(e) => e.stopPropagation()} style={{gridColumn: '1 / -1', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, marginBottom: '12px'}}>
                                <Activity size={16} color="#3b82f6" /> AI Triage Assessment Details
                              </div>
                              
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px'}}>
                                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                  <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Priority Level</span>
                                  <span style={{
                                    fontSize: '15px', 
                                    fontWeight: 700, 
                                    color: appt.priority_level === 'HIGH' ? '#dc2626' : appt.priority_level === 'MEDIUM' ? '#d97706' : '#2563eb'
                                  }}>
                                    {appt.priority_level}
                                  </span>
                                </div>
                                
                                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                  <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Priority Score</span>
                                  <span style={{fontSize: '15px', fontWeight: 700, color: '#1e293b'}}>{appt.priority_score} / 100</span>
                                </div>

                                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                  <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>AI Model Used</span>
                                  <span style={{fontSize: '13px', fontWeight: 600, color: '#475569'}}>{appt.ai_model_used || 'gemini-1.5-flash'}</span>
                                </div>
                              </div>

                              <div style={{marginBottom: '16px'}}>
                                <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px'}}>Clinical Reason & Logic</span>
                                <p style={{fontSize: '14px', color: '#334155', background: '#faf5ff', padding: '12px', borderRadius: '8px', border: '1px solid #f3e8ff', margin: 0, lineHeight: 1.5}}>
                                  {appt.ai_reasoning || "Triage evaluation completed successfully."}
                                </p>
                              </div>

                              {appt.first_aid_advice && appt.first_aid_advice.length > 0 && (
                                <div style={{marginTop: '16px'}}>
                                  <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px'}}>First-Aid & Safety Recommendations</span>
                                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                    {appt.first_aid_advice.map((item, index) => (
                                      <div key={index} style={{background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                                        <div style={{background: '#10b981', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'}}>
                                          ✓
                                        </div>
                                        <div>
                                          <div style={{fontWeight: 700, color: '#064e3b', fontSize: '13px', textTransform: 'capitalize'}}>{item.symptom || item["symptom"]}</div>
                                          <div style={{color: '#065f46', fontSize: '13px', marginTop: '2px', lineHeight: 1.4}}>{item.advice || item["advice"]}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {appt.status === 'completed' && (appt.diagnosis || appt.notes) && (
                            <div className="pd-appt-record" onClick={(e) => e.stopPropagation()} style={{gridColumn: '1 / -1', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, marginBottom: '8px'}}>
                                <FileText size={16} color="#3b82f6" /> Medical Record
                              </div>
                              {appt.diagnosis && (
                                <div style={{marginBottom: '8px'}}>
                                  <span style={{fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Diagnosis</span>
                                  <span style={{fontSize: '14px', color: '#0f172a'}}>{appt.diagnosis}</span>
                                </div>
                              )}
                              {appt.notes && (
                                <div>
                                  <span style={{fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Clinical Notes</span>
                                  <div style={{fontSize: '14px', color: '#475569', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px'}}>
                                    {appt.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="pd-empty-state">
                        <p>No appointments found. Start by recording your symptoms.</p>
                      </div>
                    )}
                </div>
                <button className="pd-btn-outline w-full mt-3">Manage All Appointments</button>
              </div>


            </div>
          </div>

          {/* Sidebar */}
          <div className="pd-grid-side">
            <div className="pd-section-top">
              <h3 className="flex items-center gap-2"><Bell size={18} color="#3b82f6"/> Recent Alerts</h3>
              <span className="pd-badge-new">4 NEW</span>
            </div>
            
            <div className="pd-alerts">
              {notifications.length > 0 ? notifications.map((notif) => {
                const Icon = getAlertIcon(notif.title);
                return (
                  <div key={notif.id} className={`pd-card pd-alert-card mb-3 ${notif.read ? 'read' : 'unread'}`}>
                    <div className="pd-alert-icon">
                      <Icon size={18} color="#0f172a" />
                    </div>
                    <div className="pd-alert-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="pd-alert-time">{new Date(notif.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="pd-empty-state-side">
                  <p>No recent alerts.</p>
                </div>
              )}
            </div>
            
            <button className="pd-clear-alerts w-full mt-2">Clear All Notifications</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pd-footer mt-auto">
        <div className="pd-footer-inner">
          <div className="pd-footer-grid">
            <div className="pd-footer-brand">
              <div className="pd-brand align-start mb-2">
                <Heart fill="#3b82f6" color="#3b82f6" size={20} />
                CareConnect
              </div>
              <p>Revolutionizing healthcare access with technology. Connect with care anytime, anywhere.</p>
              <div className="pd-social">
                {/* SVG placeholders for social icons */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
            </div>
            
            <div className="pd-footer-links">
              <h4>PATIENTS</h4>
              <a href="#">Register</a>
              <a href="#">Login</a>
              <a href="#">My Dashboard</a>
            </div>
            
            <div className="pd-footer-links">
              <h4>SUPPORT</h4>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            
            <div className="pd-footer-links">
              <h4>STAFF</h4>
              <a href="#">Admin Sign In</a>
              <a href="#">System Status</a>
            </div>
          </div>
          
          <div className="pd-footer-bottom mt-5 text-center text-sm pt-4 border-t">
            © 2026 CareConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default PatientDashboard;

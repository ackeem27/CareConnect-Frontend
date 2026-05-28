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
  Camera,
  Loader2,
  Lock,
  Phone,
  User as UserIcon,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, appointmentService, notificationService } from '../services/dataService';
import { API_HOST } from '../services/apiClient';
import toast from 'react-hot-toast';
import '../styles/PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [visitTab, setVisitTab] = useState('upcoming');
  const [notifications, setNotifications] = useState([]);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [expandedApptId, setExpandedApptId] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    symptoms: '',
    severity: 'low',
    preferred_date: ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    password: '',
    passwordConfirmation: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      navigate('/patientLogin');
      return;
    }
    setUser(currentUser);
    setProfileForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      password: '',
      passwordConfirmation: ''
    });
    
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
      }
    };

    loadData();
  }, [navigate]);

  const handleSignOut = () => {
    authService.logout();
    navigate('/');
  };

  const getAvatarUrl = (profileUser = user) => {
    if (avatarPreview) return avatarPreview;
    if (profileUser?.avatar_url) return `${API_HOST}${profileUser.avatar_url}`;
    return `https://ui-avatars.com/api/?background=random&color=fff&name=${encodeURIComponent(profileUser?.name || 'Patient')}`;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (profileForm.password && profileForm.password !== profileForm.passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('user[name]', profileForm.name);
      formData.append('user[phone]', profileForm.phone || '');
      if (profileForm.password) {
        formData.append('user[password]', profileForm.password);
        formData.append('user[password_confirmation]', profileForm.passwordConfirmation);
      }
      if (avatarFile) {
        formData.append('user[avatar]', avatarFile);
      }

      await authService.updateProfile(formData);
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      setProfileForm({
        name: updatedUser?.name || '',
        phone: updatedUser?.phone || '',
        password: '',
        passwordConfirmation: ''
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowProfileModal(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getAlertIcon = (title) => {
    const safeTitle = (title || '').toLowerCase();
    if (safeTitle.includes('prescription') || safeTitle.includes('pill')) return Pill;
    if (safeTitle.includes('confirmed') || safeTitle.includes('booked') || safeTitle.includes('approved')) return CheckCircle2;
    if (safeTitle.includes('reminder') || safeTitle.includes('flu') || safeTitle.includes('priority')) return AlertCircle;
    return Info;
  };

  const getNotificationPriority = (notif) => {
    const text = `${notif.title || ''} ${notif.message || ''} ${notif.notification_type || ''}`.toLowerCase();
    if (text.includes('rejected') || text.includes('urgent') || text.includes('high') || text.includes('priority_change') || text.includes('system_alert')) return 'high';
    if (text.includes('approved') || text.includes('confirmed') || text.includes('schedule') || text.includes('reminder')) return 'medium';
    return 'normal';
  };

  const filteredNotifications = notifications
    .filter((notif) => {
      const priority = getNotificationPriority(notif);
      if (notificationFilter === 'unread') return !notif.read;
      if (notificationFilter === 'important') return priority === 'high' || priority === 'medium';
      if (notificationFilter === 'schedule') return ['appointment_approved', 'appointment_booked', 'schedule_update'].includes(notif.notification_type);
      return true;
    })
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, normal: 1 };
      const unreadDiff = Number(a.read) - Number(b.read);
      if (unreadDiff !== 0) return unreadDiff;
      return priorityWeight[getNotificationPriority(b)] - priorityWeight[getNotificationPriority(a)];
    });

  const notificationCounts = {
    all: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    important: notifications.filter(n => ['high', 'medium'].includes(getNotificationPriority(n))).length,
    schedule: notifications.filter(n => ['appointment_approved', 'appointment_booked', 'schedule_update'].includes(n.notification_type)).length
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Notifications marked as read');
    } catch (err) {
      toast.error(err.message || 'Failed to mark notifications as read');
    }
  };

  const handleClearNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationService.clear();
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (err) {
      toast.error(err.message || 'Failed to clear notifications');
    }
  };

  const refreshAppointments = async () => {
    const apptData = await appointmentService.fetchMyAppointments();
    setAppointments(apptData);
  };

  const openAppointmentEditor = (appt) => {
    setEditingAppointment(appt);
    setAppointmentForm({
      symptoms: formatSymptoms(appt.symptoms),
      severity: appt.severity || 'low',
      preferred_date: appt.preferred_date ? new Date(appt.preferred_date).toISOString().slice(0, 16) : ''
    });
  };

  const handleSaveAppointmentChanges = async (e) => {
    e.preventDefault();
    if (!editingAppointment) return;
    if (!appointmentForm.symptoms.trim()) {
      toast.error('Please describe your symptoms.');
      return;
    }

    try {
      await appointmentService.updateAppointment(editingAppointment.id, {
        symptoms: appointmentForm.symptoms.split(',').map(item => item.trim()).filter(Boolean),
        severity: appointmentForm.severity,
        preferred_date: appointmentForm.preferred_date ? new Date(appointmentForm.preferred_date).toISOString() : null
      });
      toast.success('Appointment request updated');
      setEditingAppointment(null);
      await refreshAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment');
    }
  };

  const handleCancelAppointment = async (appt) => {
    if (!window.confirm('Cancel this appointment request?')) return;
    try {
      await appointmentService.cancel(appt.id);
      toast.success('Appointment cancelled');
      await refreshAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  const getVisitDate = (appt) => appt.scheduled_at || appt.updated_at || appt.created_at;

  const formatSymptoms = (symptoms) => {
    if (Array.isArray(symptoms)) return symptoms.join(', ');
    return symptoms || 'No symptoms recorded';
  };

  const getDoctorName = (appt) => {
    if (appt.doctor?.name) return `Dr. ${appt.doctor.name}`;
    return appt.doctor_id ? 'Assigned doctor' : 'Not assigned';
  };

  const hasLabResults = (appt) => appt.lab_status === 'completed' || Boolean(appt.lab_results);
  const upcomingVisits = appointments.filter(appt => !['completed', 'rejected', 'cancelled'].includes(appt.status));
  const pastVisits = appointments.filter(appt => ['completed', 'rejected', 'cancelled'].includes(appt.status) || appt.diagnosis || appt.notes);
  const visibleAppointments = visitTab === 'past' ? pastVisits : upcomingVisits;
  const activeAppointmentCount = upcomingVisits.length;

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
          <button
            type="button"
            className="pd-avatar-button"
            onClick={() => setShowProfileModal(true)}
            title="Edit profile"
          >
            <img src={getAvatarUrl()} alt="Profile" className="pd-avatar" />
            <span className="pd-avatar-edit-dot">
              <Camera size={12} />
            </span>
          </button>
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
            <p>You have {activeAppointmentCount} active appointment{activeAppointmentCount === 1 ? '' : 's'} in your care timeline.</p>
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
                  <h3>{visitTab === 'past' ? 'Past Visits' : 'My Appointments'}</h3>
                  <div className="pd-toggle">
                    <button className={visitTab === 'upcoming' ? 'active' : ''} onClick={() => setVisitTab('upcoming')}>Upcoming</button>
                    <button className={visitTab === 'past' ? 'active' : ''} onClick={() => setVisitTab('past')}>Past</button>
                  </div>
                </div>
                <div className="pd-appt-list">
                    {visibleAppointments.length > 0 ? (
                      visibleAppointments.map((appt) => (
                        <div 
                          key={appt.id} 
                          className={`pd-appt-card ${visitTab === 'past' ? 'pd-past-visit-card' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedApptId(expandedApptId === appt.id ? null : appt.id)}
                        >
                          <div className="pd-appt-avatar bg-gray-subtle">
                            <Stethoscope size={24} color="#64748b" />
                          </div>
                          <div className="pd-appt-info">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {visitTab === 'past' ? (appt.diagnosis || 'Completed Visit') : 'AI Triage:'}
                              <span style={{
                                color: appt.priority_level === 'HIGH' ? '#dc2626' : appt.priority_level === 'MEDIUM' ? '#d97706' : '#2563eb',
                                fontWeight: 800
                              }}>
                                {visitTab === 'past' ? '' : appt.priority_level}
                              </span>
                            </h4>
                            <p className="pd-appt-desc">Symptoms: {formatSymptoms(appt.symptoms)}</p>
                            <div className="pd-appt-meta">
                              <span><CalendarIcon /> {new Date(getVisitDate(appt)).toLocaleDateString()}</span>
                              <span><Clock size={12} /> {new Date(getVisitDate(appt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span><Stethoscope size={12} /> {getDoctorName(appt)}</span>
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

                          {manageMode && visitTab === 'upcoming' && (
                            <div className="pd-appt-manage-row" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => openAppointmentEditor(appt)}>Edit Request</button>
                              <button type="button" onClick={() => openAppointmentEditor(appt)}>Reschedule</button>
                              <button type="button" className="danger" onClick={() => handleCancelAppointment(appt)}>Cancel</button>
                            </div>
                          )}
                          
                          {expandedApptId === appt.id && (
                            <div className="pd-appt-triage-detail" onClick={(e) => e.stopPropagation()} style={{gridColumn: '1 / -1', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, marginBottom: '12px'}}>
                                <Activity size={16} color="#3b82f6" /> {visitTab === 'past' ? 'Visit Summary' : 'AI Triage Assessment Details'}
                              </div>
                              
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px'}}>
                                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                  <span style={{fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Doctor</span>
                                  <span style={{fontSize: '15px', fontWeight: 700, color: '#1e293b'}}>{getDoctorName(appt)}</span>
                                </div>
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

                              {visitTab === 'past' && (appt.diagnosis || appt.notes) && (
                                <div className="pd-visit-record-box">
                                  {appt.diagnosis && (
                                    <div>
                                      <span className="pd-record-label">Diagnosis</span>
                                      <p className="pd-record-value">{appt.diagnosis}</p>
                                    </div>
                                  )}
                                  {appt.notes && (
                                    <div>
                                      <span className="pd-record-label">Doctor Notes & Treatment Plan</span>
                                      <div className="pd-record-notes">{appt.notes}</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {hasLabResults(appt) && (
                                <div className="pd-visit-record-box pd-lab-record-box">
                                  <span className="pd-record-label">Laboratory Results</span>
                                  {appt.lab_tests && <p className="pd-lab-tests">Tests: {appt.lab_tests}</p>}
                                  <div className="pd-record-notes">{appt.lab_results || 'Lab request completed.'}</div>
                                </div>
                              )}

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

                        </div>
                      ))
                    ) : (
                      <div className="pd-empty-state">
                        <p>{visitTab === 'past' ? 'No past visits recorded yet.' : 'No active appointments found. Start by recording your symptoms.'}</p>
                      </div>
                    )}
                </div>
                <button className="pd-btn-outline w-full mt-3" onClick={() => setManageMode(prev => !prev)}>
                  {manageMode ? 'Done Managing' : 'Manage All Appointments'}
                </button>
              </div>


            </div>
          </div>

          {/* Sidebar */}
          <div className="pd-grid-side">
            <div className="pd-notification-panel">
            <div className="pd-section-top pd-notification-top">
              <div>
                <h3 className="flex items-center gap-2"><Bell size={18} color="#3b82f6"/> Notification Center</h3>
                <p className="pd-notification-sub">Sorted by unread and clinical importance</p>
              </div>
              <span className="pd-badge-new">{notificationCounts.unread} NEW</span>
            </div>

            <div className="pd-notification-filters">
              {[
                ['all', 'All'],
                ['unread', 'Unread'],
                ['important', 'Important'],
                ['schedule', 'Schedule']
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={notificationFilter === id ? 'active' : ''}
                  onClick={() => setNotificationFilter(id)}
                >
                  {label} <span>{notificationCounts[id]}</span>
                </button>
              ))}
            </div>
            
            <div className="pd-alerts">
              {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => {
                const Icon = getAlertIcon(notif.title);
                const priority = getNotificationPriority(notif);
                return (
                  <div key={notif.id} className={`pd-card pd-alert-card mb-3 ${notif.read ? 'read' : 'unread'} priority-${priority}`}>
                    <div className={`pd-alert-icon priority-${priority}`}>
                      <Icon size={18} color="#0f172a" />
                    </div>
                    <div className="pd-alert-content">
                      <div className="pd-alert-title-row">
                        <h4>{notif.title}</h4>
                        <span className={`pd-alert-priority ${priority}`}>{priority}</span>
                      </div>
                      <p>{notif.message}</p>
                      <div className="pd-alert-footer">
                        <span className="pd-alert-time">{new Date(notif.created_at).toLocaleDateString()}</span>
                        {!notif.read && (
                          <button type="button" onClick={() => handleMarkNotificationRead(notif.id)}>Mark read</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="pd-empty-state-side">
                  <p>No notifications match this filter.</p>
                </div>
              )}
            </div>
            
            <div className="pd-notification-actions">
              <button className="pd-clear-alerts" onClick={handleMarkAllRead}>Mark All Read</button>
              <button className="pd-clear-alerts danger" onClick={handleClearNotifications}>Clear All</button>
            </div>
            </div>
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
              <button type="button">Register</button>
              <button type="button">Login</button>
              <button type="button">My Dashboard</button>
            </div>
            
            <div className="pd-footer-links">
              <h4>SUPPORT</h4>
              <button type="button">Help Center</button>
              <button type="button">Privacy Policy</button>
              <button type="button">Terms of Service</button>
            </div>
            
            <div className="pd-footer-links">
              <h4>STAFF</h4>
              <button type="button">Admin Sign In</button>
              <button type="button">System Status</button>
            </div>
          </div>
          
          <div className="pd-footer-bottom mt-5 text-center text-sm pt-4 border-t">
            © 2026 CareConnect. All rights reserved.
          </div>
        </div>
      </footer>

      {showProfileModal && (
        <div className="pd-profile-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="pd-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-profile-modal-header">
              <div>
                <h3>Edit Profile</h3>
                <p>Update your patient details and profile picture.</p>
              </div>
              <button
                type="button"
                className="pd-profile-close"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close profile editor"
              >
                <X size={18} />
              </button>
            </div>

            <form className="pd-profile-form" onSubmit={handleProfileSave}>
              <div className="pd-profile-avatar-upload">
                <div className="pd-profile-avatar-preview">
                  <img src={getAvatarUrl()} alt="Profile preview" />
                  <label htmlFor="patient-avatar-input" className="pd-profile-camera">
                    <Camera size={14} color="white" />
                  </label>
                </div>
                <input
                  id="patient-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <span>Click the camera to upload a new picture</span>
              </div>

              <label className="pd-profile-field">
                <span><UserIcon size={14} /> Full Name</span>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </label>

              <label className="pd-profile-field">
                <span><Phone size={14} /> Phone Number</span>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </label>

              <label className="pd-profile-field">
                <span><Lock size={14} /> Change Password</span>
                <input
                  type="password"
                  placeholder="Optional new password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                />
              </label>

              <label className="pd-profile-field">
                <span><Lock size={14} /> Confirm Password</span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={profileForm.passwordConfirmation}
                  onChange={(e) => setProfileForm({ ...profileForm, passwordConfirmation: e.target.value })}
                />
              </label>

              <div className="pd-profile-actions">
                <button
                  type="button"
                  className="pd-profile-cancel"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pd-profile-submit" disabled={updatingProfile}>
                  {updatingProfile ? (
                    <>
                      <Loader2 className="pd-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAppointment && (
        <div className="pd-profile-overlay" onClick={() => setEditingAppointment(null)}>
          <div className="pd-appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-profile-modal-header">
              <div>
                <h3>Manage Appointment</h3>
                <p>Edit symptoms, urgency, or request a different preferred time.</p>
              </div>
              <button
                type="button"
                className="pd-profile-close"
                onClick={() => setEditingAppointment(null)}
                aria-label="Close appointment editor"
              >
                <X size={18} />
              </button>
            </div>

            <form className="pd-profile-form" onSubmit={handleSaveAppointmentChanges}>
              <label className="pd-profile-field">
                <span><Activity size={14} /> Symptoms</span>
                <textarea
                  value={appointmentForm.symptoms}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, symptoms: e.target.value })}
                  placeholder="Separate symptoms with commas"
                  rows={4}
                  required
                />
              </label>

              <label className="pd-profile-field">
                <span><AlertCircle size={14} /> Severity</span>
                <select
                  value={appointmentForm.severity}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, severity: e.target.value })}
                >
                  <option value="low">Stable</option>
                  <option value="moderate">Urgent</option>
                  <option value="severe">Critical</option>
                </select>
              </label>

              <label className="pd-profile-field">
                <span><Clock size={14} /> Preferred Date & Time</span>
                <input
                  type="datetime-local"
                  value={appointmentForm.preferred_date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, preferred_date: e.target.value })}
                />
              </label>

              <div className="pd-appointment-modal-note">
                Reception will review schedule changes and confirm the final appointment time.
              </div>

              <div className="pd-profile-actions">
                <button
                  type="button"
                  className="pd-profile-cancel"
                  onClick={() => setEditingAppointment(null)}
                >
                  Close
                </button>
                <button type="submit" className="pd-profile-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

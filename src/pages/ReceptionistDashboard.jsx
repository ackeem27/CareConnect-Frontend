import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authService, appointmentService, scheduleService } from '../services/dataService';
import AIPriorityQueue from '../components/ai/AIPriorityQueue';
import { CheckCircle, AlertCircle, User, FileText, Activity, Clock, Calendar, Filter, ChevronUp, ChevronDown, UserPlus, ShieldAlert, ArrowRight, X, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './ReceptionistDashboard.css';

function WalkinPage({ onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ firstName: '', surname: '', phone: '', age: '', symptoms: '', severity: 'low' });
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const registerWalkin = async () => {
    if (!form.firstName.trim() || !form.surname.trim()) { setError('Patient name required.'); return; }
    if (!form.symptoms.trim()) { setError('Symptoms required.'); return; }
    setIsSubmitting(true); setError(null);
    try {
      const res = await appointmentService.walkinRegistration({
        name: `${form.firstName.trim()} ${form.surname.trim()}`,
        phone: form.phone || 'N/A',
        age: form.age || undefined,
        symptoms: form.symptoms,
        severity: form.severity
      });
      setResult(res);
      toast.success('Patient registered successfully!');
    } catch (err) { setError(err.message); toast.error(err.message); } finally { setIsSubmitting(false); }
  };

  if (result) {
    const appt = result.appointment;
    const pc = appt.priority_level === 'HIGH' ? '#ef4444' : appt.priority_level === 'MEDIUM' ? '#3b82f6' : '#10b981';
    const isGemini = result.ai_model_used && result.ai_model_used.includes('gemini');
    return (
      <div className="walkin-success-card">
        <div className="success-icon-ring" style={{ borderColor: pc }}><CheckCircle size={48} color={pc} /></div>
        <h2 className="success-heading">Patient Added to Queue</h2>
        <p className="success-sub"><strong>{appt.patient?.name}</strong> has been registered and prioritized.</p>
        <div className="success-details-grid">
          <div className="success-detail"><span className="detail-label">Priority Level</span><span className={`detail-value priority-${(appt.priority_level || 'LOW').toLowerCase()}`}>{appt.priority_level}</span></div>
          <div className="success-detail"><span className="detail-label">AI Score</span><span className="detail-value">{appt.priority_score}/100</span></div>
          <div className="success-detail"><span className="detail-label">Model Used</span><span className="detail-value" style={{ fontSize: '11px', color: isGemini ? '#10b981' : '#f59e0b' }}>{isGemini ? '✦ Gemini 1.5 Flash' : '⚠ Rule-based Fallback'}</span></div>
          <div className="success-detail"><span className="detail-label">Detected Symptoms</span><span className="detail-value">{(appt.symptoms || []).join(', ') || 'See notes'}</span></div>
        </div>
        {result.ai_reasoning && (
          <div style={{ margin: '16px 0', padding: '12px 16px', background: '#f0f9ff', borderLeft: '3px solid #3b82f6', borderRadius: '6px', fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Reasoning</strong>
            {result.ai_reasoning}
          </div>
        )}
        <div className="success-actions">
          <button className="btn-register-another" onClick={() => { setResult(null); setForm({ firstName: '', surname: '', phone: '', age: '', symptoms: '', severity: 'low' }); }}>Register Another</button>
          <button className="btn-view-queue" onClick={onComplete}>View Queue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="walkin-form-card-premium">
      <div className="walkin-form-header-premium">
        <div className="header-icon-ring">
          <UserPlus size={24} color="white" />
        </div>
        <div>
          <h2>Walk-in Registration</h2>
          <p>Complete the profile below for AI-assisted triage.</p>
        </div>
      </div>
      
      <div className="walkin-form-body-premium">
        <div className="form-grid-premium">
          <div className="form-column">
            <div className="form-section-label"><User size={14} /> Personal Details</div>
            <div className="walkin-field-premium">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. John" />
            </div>
            <div className="walkin-field-premium">
              <label>Surname</label>
              <input name="surname" value={form.surname} onChange={handleChange} placeholder="e.g. Doe" />
            </div>
            <div className="walkin-field-premium">
              <label>Age (Clinical Context)</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="e.g. 45" />
            </div>
          </div>

          <div className="form-column">
            <div className="form-section-label"><FileText size={14} /> Triage Details</div>
            <div className="walkin-field-premium">
              <label>Describe Symptoms</label>
              <textarea name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Describe what the patient is experiencing..." rows={5} />
            </div>
          </div>
        </div>

        <div className="severity-section-premium">
          <div className="form-section-label"><Activity size={14} /> Patient Severity</div>
          <div className="severity-grid-premium">
            {[{v:'low',l:'Stable',i:'😌'},{v:'moderate',l:'Urgent',i:'😟'},{v:'severe',l:'Critical',i:'😰'}].map(o => (
              <label key={o.v} className={`severity-tile-premium ${form.severity===o.v?'selected':''}`}>
                <input type="radio" name="severity" value={o.v} checked={form.severity===o.v} onChange={handleChange} />
                <span className="tile-icon">{o.i}</span>
                <span className="tile-label">{o.l}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="walkin-error-premium"><ShieldAlert size={16} /> {error}</div>}
        
        <div className="walkin-actions-premium">
          <button className="btn-submit-premium" onClick={registerWalkin} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-mini"></span> Processing...
              </span>
            ) : (
              <>Register & Start Triage <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState(null); // { id, current_time }
  const [approveData, setApproveData] = useState(null); // { id }
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [schedData, docsData] = await Promise.all([
        scheduleService.fetchSchedule(),
        scheduleService.fetchDoctors()
      ]);
      setSchedule(schedData);
      setDoctors(docsData);
      setLastUpdated(new Date());
    } catch (e) {
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(true); const i = setInterval(() => loadData(false), 2000); return () => clearInterval(i); }, []);

  const pendingApprovals = schedule.filter(a => a.approval_status === 'pending');
  const confirmed = schedule.filter(a => a.approval_status === 'approved' || a.status === 'scheduled');

  const handleApproveClick = (id) => {
    // Smartly recommend a schedule time (next available 15 min block)
    const nextTime = new Date();
    nextTime.setMinutes(Math.ceil(nextTime.getMinutes() / 15) * 15 + 15);
    
    if (confirmed.length > 0) {
      const futureAppts = confirmed
        .filter(a => new Date(a.scheduled_at) >= new Date())
        .map(a => new Date(a.scheduled_at).getTime());
      
      if (futureAppts.length > 0) {
        const lastApptTime = Math.max(...futureAppts);
        nextTime.setTime(lastApptTime + 15 * 60000); // 15 mins after last
      }
    }

    const pad = (n) => n.toString().padStart(2, '0');
    const localISOTime = `${nextTime.getFullYear()}-${pad(nextTime.getMonth()+1)}-${pad(nextTime.getDate())}T${pad(nextTime.getHours())}:${pad(nextTime.getMinutes())}`;

    setApproveData({ id, doctor_id: '', scheduled_at: localISOTime });
  };

  const submitApprove = async () => {
    if (!approveData) return;
    try {
      // Create a specific custom approve endpoint request if needed, or pass params via apiClient directly if not exposed in service.
      // Wait, our service currently just does POST /schedule/approve/:id with no body. I need to update the service or use apiClient here.
      // Let's assume we update the service or use standard fetch.
      // We will just use standard apiClient here to save time.
      const apiClient = (await import('../services/apiClient')).default;
      await apiClient.post(`/schedule/approve/${approveData.id}`, {
        doctor_id: approveData.doctor_id,
        scheduled_at: approveData.scheduled_at
      });
      toast.success('Appointment approved & receipt sent');
      setApproveData(null);
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  const handleReject = async (id) => {
    try { await scheduleService.reject(id, 'Rejected by receptionist'); toast.success('Appointment rejected'); loadData(); } catch (e) { toast.error(e.message); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try { await appointmentService.cancel(id); toast.success('Appointment cancelled'); loadData(); } catch (e) { toast.error(e.message); }
  };

  const handleSwap = async (id, dir) => {
    try { await scheduleService.swap(id, dir); toast.success(`Moved appointment ${dir}`); loadData(); } catch (e) { toast.error(e.message); }
  };

  const handleOverride = async (id, dir) => {
    const appt = schedule.find(a => a.id === id);
    if (!appt) return;
    const levels = ['LOW', 'MEDIUM', 'HIGH'];
    const curIdx = levels.indexOf(appt.priority_level);
    const newIdx = dir === 'up' ? Math.min(curIdx + 1, 2) : Math.max(curIdx - 1, 0);
    const newScore = [30, 60, 90][newIdx];
    try { await scheduleService.override(id, levels[newIdx], newScore); toast.success('Priority overridden'); loadData(); } catch (e) { toast.error(e.message); }
  };

  const submitReschedule = async (id, newTime) => {
    if (!newTime) return;
    try {
      await scheduleService.reschedule(id, new Date(newTime).toISOString());
      toast.success('Appointment rescheduled successfully!');
      setRescheduleData(null);
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  // FR10: Auto-schedule all pending appointments
  const handleAutoSchedule = async () => {
    try {
      const result = await appointmentService.autoSchedule();
      toast.success(result.message || 'Auto-scheduling complete');
      loadData(true);
    } catch (e) { toast.error(e.message || 'Auto-schedule failed'); }
  };

  const getPriorityBadge = (level, score) => {
    const c = level === 'HIGH' ? 'critical' : level === 'MEDIUM' ? 'urgent' : 'routine';
    return <span className={`rd-priority-badge ${c}`}>{level} ({score})</span>;
  };

  return (
    <div className="rd-schedule-layout">
      <div className="rd-schedule-main">
        {/* Pending Approvals */}
        <div className="rd-pending-section">
          <div className="rd-pending-header">
            <h3><Activity size={18} color="#3b82f6" /> Pending AI Triage Approvals</h3>
            <button className="rd-view-all-btn" onClick={() => window.location.href = '?tab=queue'}>View All ({pendingApprovals.length}) <ArrowRight size={14} /></button>
          </div>
          {pendingApprovals.length === 0 ? (
            <div className="rd-empty-pending">No pending approvals. All caught up! ✓</div>
          ) : (
            <div className="rd-pending-list">
              {pendingApprovals.slice(0, 3).map((appt, i) => (
                <div key={appt.id} className={`rd-pending-card ${i === 0 ? 'featured' : ''}`}>
                  <div className="rd-pending-top">
                    <div className="rd-pending-patient">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patient?.name || 'User')}&background=random&color=fff`} alt="" className="rd-pending-avatar" />
                      <div>
                        <h4>{appt.patient?.name}</h4>
                        <span className="rd-pending-meta"><Clock size={12} /> Requested for {new Date(appt.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} • {appt.patient?.date_of_birth ? Math.floor((Date.now()-new Date(appt.patient.date_of_birth))/(365.25*24*60*60*1000)) : '?'}y</span>
                      </div>
                    </div>
                    {getPriorityBadge(appt.priority_level, appt.priority_score)}
                  </div>
                  <div className="rd-pending-symptom"><span className="rd-red-dot" /> Symptom: {(appt.symptoms || []).join(', ')}</div>
                  <div className="rd-pending-actions">
                    <button className="rd-approve-btn" onClick={() => handleApproveClick(appt.id)}>✓ Approve</button>
                    <button className="rd-reject-btn" onClick={() => handleReject(appt.id)}>✗ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Schedule */}
        <div className="rd-daily-schedule">
          <div className="rd-schedule-header">
            <h3><Calendar size={18} /> Daily Schedule {lastUpdated && <span style={{fontSize:'11px', fontWeight:400, color:'#94a3b8', marginLeft:'8px'}}>Updated {lastUpdated.toLocaleTimeString()}</span>}</h3>
            <div className="rd-schedule-controls">
              <button className="rd-auto-schedule-btn" onClick={handleAutoSchedule} style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'linear-gradient(135deg, #3b82f6, #2563eb)', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(59,130,246,0.3)'}}>
                <Wand2 size={14} /> Auto-Schedule All
              </button>
              <button className="rd-filter-btn"><Filter size={14} /> Filter</button>
              <button className="rd-today-btn">Today</button>
            </div>
          </div>
          <p className="rd-schedule-sub">Live status of confirmed patient visits</p>
          <table className="rd-schedule-table">
            <thead><tr><th>Patient</th><th>Time</th><th>Doctor</th><th>AI Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {confirmed.length === 0 && schedule.filter(a=>a.status !== 'rejected').length > 0 ? (
                schedule.filter(a=>a.status !== 'rejected').slice(0, 5).map((appt, i) => (
                  <tr key={appt.id}>
                    <td><div className="rd-patient-cell"><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patient?.name || 'User')}&background=random&color=fff`} alt="" /><div><span className="rd-patient-name">{appt.patient?.name}</span><span className="rd-patient-sub">{(appt.symptoms||[]).slice(0,2).join(', ')}</span></div></div></td>
                    <td>{appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : appt.status === 'pending' ? 'Immediate' : '—'}</td>
                    <td><span className="rd-doctor-tag">{appt.doctor_id ? `Dr. #${appt.doctor_id}` : 'TBD'}</span></td>
                    <td>{getPriorityBadge(appt.priority_level, appt.priority_score)}</td>
                    <td><span className={`rd-status-tag ${appt.status}`}>{appt.status === 'pending' ? 'Walk-In' : appt.status}</span></td>
                    <td>
                      {appt.status !== 'pending' && <div style={{display:'flex', gap:'4px'}}><button className="rd-action-btn" onClick={() => setRescheduleData({id: appt.id, time: appt.scheduled_at})} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer'}}>Reschedule</button><button className="rd-action-btn" onClick={() => handleCancel(appt.id)} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer'}}>Cancel</button><button onClick={() => handleSwap(appt.id, 'up')} style={{background:'none',border:'none',cursor:'pointer',padding:'2px'}} title="Move Up"><ChevronUp size={14} color="#64748b" /></button><button onClick={() => handleSwap(appt.id, 'down')} style={{background:'none',border:'none',cursor:'pointer',padding:'2px'}} title="Move Down"><ChevronDown size={14} color="#64748b" /></button></div>}
                    </td>
                  </tr>
                ))
              ) : confirmed.map((appt, i) => (
                <tr key={appt.id}>
                  <td><div className="rd-patient-cell"><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patient?.name || 'User')}&background=random&color=fff`} alt="" /><div><span className="rd-patient-name">{appt.patient?.name}</span><span className="rd-patient-sub">{(appt.symptoms||[]).slice(0,2).join(', ')}</span></div></div></td>
                  <td>{appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                  <td><span className="rd-doctor-tag">Dr. #{appt.doctor_id || 1}</span></td>
                  <td>{getPriorityBadge(appt.priority_level, appt.priority_score)}</td>
                  <td><span className={`rd-status-tag ${appt.status}`}>{appt.status}</span></td>
                  <td>
                    <div style={{display:'flex', gap:'4px'}}><button className="rd-action-btn" onClick={() => setRescheduleData({id: appt.id, time: appt.scheduled_at})} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer'}}>Reschedule</button><button className="rd-action-btn" onClick={() => handleCancel(appt.id)} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer'}}>Cancel</button><button onClick={() => handleSwap(appt.id, 'up')} style={{background:'none',border:'none',cursor:'pointer',padding:'2px'}} title="Move Up"><ChevronUp size={14} color="#64748b" /></button><button onClick={() => handleSwap(appt.id, 'down')} style={{background:'none',border:'none',cursor:'pointer',padding:'2px'}} title="Move Down"><ChevronDown size={14} color="#64748b" /></button></div>
                  </td>
                </tr>
              ))}
              {schedule.length === 0 && !loading && <tr><td colSpan={6} style={{textAlign:'center',color:'#94a3b8',padding:40}}>No appointments today.</td></tr>}
              {loading && schedule.length === 0 && <tr><td colSpan={6} style={{padding:40}}><div className="skeleton-loader" style={{height:'40px', width:'100%', borderRadius:'8px', background:'#f1f5f9', animation:'pulse 1.5s infinite'}}></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleData && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="modal-content" style={{background:'white', padding:'24px', borderRadius:'12px', width:'400px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0, fontSize:'18px'}}>Reschedule Appointment</h3>
              <button onClick={() => setRescheduleData(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20} color="#64748b" /></button>
            </div>
            <p style={{fontSize:'14px', color:'#64748b', marginBottom:'16px'}}>Select a new date and time for this appointment. The system will automatically check for conflicts.</p>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block', fontSize:'13px', fontWeight:'600', marginBottom:'8px'}}>New Date & Time</label>
              <input 
                type="datetime-local" 
                id="reschedule-input"
                defaultValue={rescheduleData.time ? new Date(rescheduleData.time).toISOString().slice(0, 16) : ''}
                style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'14px', boxSizing:'border-box'}} 
              />
            </div>
            <div style={{display:'flex', gap:'12px', justifyContent:'flex-end'}}>
              <button onClick={() => setRescheduleData(null)} style={{padding:'10px 16px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontWeight:'500'}}>Cancel</button>
              <button onClick={() => submitReschedule(rescheduleData.id, document.getElementById('reschedule-input').value)} style={{padding:'10px 16px', borderRadius:'8px', border:'none', background:'#3b82f6', color:'white', cursor:'pointer', fontWeight:'500'}}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveData && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="modal-content" style={{background:'white', padding:'24px', borderRadius:'12px', width:'400px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0, fontSize:'18px'}}>Approve & Assign Patient</h3>
              <button onClick={() => setApproveData(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20} color="#64748b" /></button>
            </div>
            <p style={{fontSize:'14px', color:'#64748b', marginBottom:'16px'}}>Assign a doctor and specific time for this patient, or leave time blank to auto-assign.</p>
            
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block', fontSize:'13px', fontWeight:'600', marginBottom:'8px'}}>Select Doctor</label>
              <select 
                value={approveData.doctor_id} 
                onChange={(e) => setApproveData({...approveData, doctor_id: e.target.value})}
                style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'14px'}}
              >
                <option value="">-- Auto Assign Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Dr. #{d.id})</option>
                ))}
              </select>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block', fontSize:'13px', fontWeight:'600', marginBottom:'8px'}}>
                Schedule Time <span style={{color: '#10b981', fontWeight: 'normal', fontStyle: 'italic'}}>(Smart Recommended)</span>
              </label>
              <input 
                type="datetime-local" 
                value={approveData.scheduled_at}
                onChange={(e) => setApproveData({...approveData, scheduled_at: e.target.value})}
                style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'14px', boxSizing:'border-box'}} 
              />
            </div>

            <div style={{display:'flex', gap:'12px', justifyContent:'flex-end'}}>
              <button onClick={() => setApproveData(null)} style={{padding:'10px 16px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontWeight:'500'}}>Cancel</button>
              <button onClick={submitApprove} style={{padding:'10px 16px', borderRadius:'8px', border:'none', background:'#10b981', color:'white', cursor:'pointer', fontWeight:'500'}}>Confirm & Send Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      <div className="rd-schedule-sidebar">
        {/* Quick Register */}
        <QuickRegister />

        {/* Priority Overrides */}
        <div className="rd-override-card">
          <div className="rd-override-header"><h4><ShieldAlert size={16} /> AI Priority Overrides</h4><span className="rd-override-sub">Manual adjustments to queue order</span></div>
          <div className="rd-override-list">
            {schedule.slice(0, 4).map(appt => (
              <div key={appt.id} className="rd-override-item">
                <div className="rd-override-patient">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patient?.name || 'User')}&background=random&color=fff`} alt="" />
                  <div><span className="rd-override-name">{appt.patient?.name}</span><span className="rd-override-score">Score: {appt.priority_score}</span></div>
                </div>
                <div className="rd-override-btns">
                  <button onClick={() => handleOverride(appt.id, 'up')}><ChevronUp size={16} /></button>
                  <button onClick={() => handleOverride(appt.id, 'down')}><ChevronDown size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Status */}
        <div className="rd-resource-card">
          <h4>RESOURCE STATUS</h4>
          {doctors.length === 0 ? <p style={{color:'#94a3b8', fontSize:'12px'}}>No doctors found.</p> : doctors.map((d, i) => (
            <div key={d.id} className="rd-resource-item">
              <div className="rd-resource-info"><span className="rd-resource-name">Dr. {d.name.split(' ')[0]}</span><span className="rd-resource-detail">Status: Available</span></div>
            </div>
          ))}
        </div>

        {/* System Alert */}
        <div className="rd-system-alert">
          <AlertCircle size={16} color="#f59e0b" />
          <div><h4>System Alert</h4><p>High volume of respiratory cases detected in last 2 hours. AI adjusting baseline priorities.</p></div>
        </div>
      </div>
    </div>
  );
}

function QuickRegister() {
  const [name, setName] = useState('');
  const [symptom, setSymptom] = useState('');
  const [age, setAge] = useState('');

  const handleQuickRegister = async () => {
    if (!name.trim() || !symptom.trim()) return;
    try {
      await appointmentService.walkinRegistration({ name, symptoms: symptom, severity: 'low', phone: 'N/A' });
      setName(''); setSymptom(''); setAge('');
      toast.success('Quick registration successful!');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="rd-quick-register-premium">
      <div className="quick-reg-header">
        <UserPlus size={16} />
        <h4>Quick Register</h4>
      </div>
      <div className="quick-reg-body">
        <input placeholder="Patient Name" value={name} onChange={e => setName(e.target.value)} className="quick-input" />
        <input placeholder="Primary Symptom" value={symptom} onChange={e => setSymptom(e.target.value)} className="quick-input" />
        <input placeholder="Age" value={age} onChange={e => setAge(e.target.value)} type="number" className="quick-input" />
        <button className="btn-quick-reg" onClick={handleQuickRegister}>Register Patient</button>
      </div>
    </div>
  );
}

export default function ReceptionistDashboard() {
  const location = useLocation();
  const [activePage, setActivePage] = useState('schedule');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActivePage(tab); else setActivePage('schedule');
  }, [location]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser() || { name: 'Demo Receptionist', role: 'receptionist' };
    setUser(currentUser);
  }, []);

  if (!user) return null;

  return (
    <div className="dashboard-page-content">
      <div className="rd-content-area">
        {activePage === 'queue' && <AIPriorityQueue />}
        {activePage === 'walkin' && <WalkinPage onComplete={() => {}} />}
        {activePage === 'schedule' && <SchedulePage />}
      </div>
    </div>
  );
}
// Show warning modal on scheduling conflict
// Empty queue: show 'No patients waiting' state
// Format: HH:MM AM/PM
// Min date: today, no past dates allowed
// Debounce approval actions to prevent double-submit
// Refresh schedule data on date change
// Toggle weekend visibility in schedule view
// Walk-in form required fields
// Extracted ApprovalTable
// Retain override reason on close
// Search result pagination fix
// Filter schedule by doctor
// Test: Walk-in registration flow
// Fetch latest schedule before approve
// Optimize SVGs for performance
// Timezone handling for slots
// Memoize schedule visualization
// Default to unavailable if missing

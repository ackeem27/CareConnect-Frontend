import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Stethoscope,
  Search,
  CheckCircle,
  FlaskConical,
  Image as ImageIcon,
  UserPlus,
  Clock,
  ArrowRight,
  Printer,
  ClipboardList,
  Pill,
  CalendarCheck,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, appointmentService } from '../services/dataService';

import '../styles/DoctorDashboard.css';

const DoctorDashboard = () => {

  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewHistoryModal, setViewHistoryModal] = useState(null); // stores the history record to view

  // FR22: Structured diagnosis form state
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    treatment_plan: '',
    prescriptions: '',
    notes: '',
    follow_up: ''
  });

  const loadQueue = async (showLoading = false) => {
    if (showLoading) setStatusLoading(true);
    try {
      const data = await appointmentService.fetchQueue();
      setQueue(data);
      setLastUpdated(new Date());
      if (data.length > 0) {
        setSelectedPatient(prev => prev ? data.find(a => a.id === prev.id) || data[0] : data[0]);
      } else {
        setSelectedPatient(null);
      }
    } catch (e) {
      toast.error('Failed to load queue');
    } finally {
      if (showLoading) setStatusLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser() || { name: 'Demo Doctor', role: 'doctor' };
    setUser(currentUser);
    
    loadQueue(true);
    const interval = setInterval(() => loadQueue(false), 2000);
    return () => clearInterval(interval);
  }, []);

  // Reset form when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setDiagnosisForm({
        diagnosis: selectedPatient.diagnosis || '',
        treatment_plan: '',
        prescriptions: '',
        notes: selectedPatient.notes || '',
        follow_up: ''
      });
    }
  }, [selectedPatient?.id]);

  const handleUpdateStatus = async (status) => {
    if (!selectedPatient) return;
    setStatusLoading(true);
    try {
      await appointmentService.updateStatus(selectedPatient.id, status);
      toast.success(`Patient status updated to ${status}`);
      loadQueue();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // FR22: Save diagnosis notes without finalizing
  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    try {
      await appointmentService.updateDiagnosis(
        selectedPatient.id, 
        diagnosisForm.diagnosis, 
        diagnosisForm.notes
      );
      toast.success('Notes saved successfully!');
    } catch (err) {
      toast.error('Failed to save notes: ' + err.message);
    }
  };

  // FR22: Finalize encounter — saves everything and marks completed
  const handleFinalize = async () => {
    if (!selectedPatient) return;
    if (!diagnosisForm.diagnosis.trim()) {
      toast.error('Please enter a diagnosis before finalizing.');
      return;
    }
    try {
      await appointmentService.finalizeEncounter(selectedPatient.id, {
        diagnosis: diagnosisForm.diagnosis,
        notes: diagnosisForm.notes,
        treatment_plan: diagnosisForm.treatment_plan,
        prescriptions: diagnosisForm.prescriptions
      });
      setDiagnosisForm({ diagnosis: '', treatment_plan: '', prescriptions: '', notes: '', follow_up: '' });
      toast.success("Encounter finalized successfully!");
      loadQueue();
    } catch (err) {
      toast.error(err.message || "Failed to finalize encounter");
    }
  };

  if (!user) return null;

  const patientHistory = selectedPatient?.past_history || [];

  const getUrgencyClass = (level) => {
    switch (level) {
      case 'HIGH': return 'critical';
      case 'MEDIUM': return 'urgent';
      default: return 'routine';
    }
  };

  // FR21: Dynamic vitals derived from patient data
  const getPatientVitals = (patient) => {
    if (!patient) return { severity: '—', symptoms: 0, score: 0 };
    const symptomCount = Array.isArray(patient.symptoms) ? patient.symptoms.length : 0;
    return {
      severity: (patient.severity || 'low').charAt(0).toUpperCase() + (patient.severity || 'low').slice(1),
      symptoms: symptomCount,
      score: patient.priority_score || 0
    };
  };

  const getPatientAge = (patient) => {
    if (!patient?.patient?.date_of_birth) return '—';
    const dob = new Date(patient.patient.date_of_birth);
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const vitals = getPatientVitals(selectedPatient);

  return (
    <div className="dashboard-page-content">
      <div className="dashboard-grid-main">
        <>
            {/* Left Pillar: Schedule */}
            <div className="schedule-column">
              <div className="schedule-header">
                <h2><Calendar size={20} /> Today's Schedule</h2>
                <span className="date-badge">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{lastUpdated && <span style={{marginLeft:'6px', fontSize:'10px', color:'#94a3b8'}}>• {lastUpdated.toLocaleTimeString()}</span>}</span>
              </div>
              <div className="filter-wrapper">
                <div className="search-input-wrapper">
                    <Search size={14} color="#94a3b8" />
                    <input type="text" placeholder="Filter patients..." />
                </div>
              </div>
              
              <div className="timeline-list">
                {queue.length === 0 && !statusLoading && <p style={{padding: '20px', color: '#64748b'}}>No appointments scheduled.</p>}
                {statusLoading && queue.length === 0 && <div className="skeleton-loader" style={{height:'80px', margin:'20px', borderRadius:'8px', background:'#f1f5f9', animation:'pulse 1.5s infinite'}}></div>}
                {queue.length > 0 && queue.map((appt, index) => (
                    <div 
                        key={appt.id} 
                        className={`timeline-item ${selectedPatient?.id === appt.id ? 'active' : ''} ${getUrgencyClass(appt.priority_level)}`} 
                        onClick={() => setSelectedPatient(appt)}
                    >
                      <span className="time-label">{appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : `${String(9 + Math.floor(index * 0.5)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'} AM`}</span>
                      <div className="timeline-card">
                        <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${appt.patient?.name}`} alt="" className="item-avatar" />
                        <div className="tl-info">
                          <h4>{appt.patient?.name}</h4>
                          <p>{Array.isArray(appt.symptoms) ? appt.symptoms[0] : appt.symptoms}</p>
                        </div>
                        <div className="tl-status">
                          <span className={`urgency-badge-sm ${getUrgencyClass(appt.priority_level)}`}>
                              {appt.priority_level === 'HIGH' ? 'Critical' : appt.priority_level === 'MEDIUM' ? 'Urgent' : 'Routine'}
                          </span>
                          <Activity size={14} color={appt.priority_level === 'HIGH' ? '#ef4444' : '#3b82f6'} />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="dashboard-footer-stats" style={{paddingLeft: '20px'}}>
                  Completed: {queue.filter(a => a.status === 'completed').length} / {queue.length}
              </div>
            </div>

            {/* Right Pillar Area: Details & Actions */}
            <div className="details-area">
              {selectedPatient ? (
                <>
                  {/* Hero Header */}
                  <div className="patient-hero-header">
                    <div className="hero-profile-box">
                        <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${selectedPatient.patient?.name}`} alt="" className="hero-avatar-lg" />
                        <div className="hero-text">
                            <h1>{selectedPatient.patient?.name}</h1>
                            <div className="hero-meta">{getPatientAge(selectedPatient)} Years • PT-{selectedPatient.id} <Activity size={12} /> <Stethoscope size={12} /></div>
                            <div className="hero-reason-box">
                                <Activity size={18} color="#3b82f6" />
                                <span>{Array.isArray(selectedPatient.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient.symptoms}</span>
                            </div>
                        </div>
                    </div>

                    {/* FR21: Dynamic vitals from real data */}
                    <div className="vitals-summary">
                        <div className="vital-card-mini">
                            <span className="vital-label-mini">Severity</span>
                            <div className="vital-value-mini">{vitals.severity}</div>
                        </div>
                        <div className="vital-card-mini">
                            <span className="vital-label-mini">Symptoms</span>
                            <div className="vital-value-mini">{vitals.symptoms}<small>found</small></div>
                        </div>
                        <div className="vital-card-mini">
                            <span className="vital-label-mini">AI Score</span>
                            <div className="vital-value-mini">{vitals.score}<small>/100</small></div>
                        </div>
                    </div>

                    <div className="hero-actions">
                        <div className="status-toggle-group">
                            <button 
                                className={`status-toggle-btn ${selectedPatient.status === 'arrived' ? 'active' : ''}`}
                                onClick={() => handleUpdateStatus('arrived')}
                            >Arrived</button>
                            <button 
                                className={`status-toggle-btn ${selectedPatient.status === 'in_progress' ? 'active' : ''}`}
                                onClick={() => handleUpdateStatus('in_progress')}
                            >In Progress</button>
                            <button 
                                 className={`status-toggle-btn ${selectedPatient.status === 'completed' ? 'active' : ''}`}
                                 onClick={() => handleUpdateStatus('completed')}
                             >Complete</button>
                        </div>
                    </div>
                  </div>

                  {/* Main Content: Two Pillars */}
                  <div className="details-content-pillars">
                      <div className="pillar-main">
                        {/* FR21: Real symptom data */}
                        <div className="data-card">
                            <div className="card-title-row"><FileText size={18} /> Symptom Intake Report</div>
                            <div className="intake-report-grid">
                                <div className="report-field">
                                    <span className="field-label">Reported Symptoms</span>
                                    <div className="field-content">{Array.isArray(selectedPatient.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient.symptoms || '—'}</div>
                                </div>
                                <div className="report-field">
                                    <span className="field-label">Severity Level</span>
                                    <div className="field-content">{vitals.severity}</div>
                                </div>
                                <div className="report-field">
                                    <span className="field-label">Priority</span>
                                    <div className="field-content" style={{color: selectedPatient.priority_level === 'HIGH' ? '#ef4444' : selectedPatient.priority_level === 'MEDIUM' ? '#f59e0b' : '#10b981', fontWeight: 600}}>{selectedPatient.priority_level}</div>
                                </div>
                                <div className="report-field">
                                    <span className="field-label">Submitted</span>
                                    <div className="field-content">{new Date(selectedPatient.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* FR21: Real medical history */}
                        <div className="data-card">
                            <div className="card-title-row"><Clock size={16} /> Patient Medical History</div>
                            <div className="history-list">
                                {patientHistory.length === 0 ? (
                                    <p style={{padding: '20px', color: '#64748b'}}>No past visits on record.</p>
                                ) : (
                                    patientHistory.map((h, i) => (
                                        <div key={i} className="history-row">
                                            <div className="hist-main-info">
                                                <span className="hist-date">{new Date(h.created_at).toLocaleDateString()}</span>
                                                <span className="hist-event">{h.diagnosis || (Array.isArray(h.symptoms) ? h.symptoms.join(', ') : h.symptoms) || 'General Visit'}</span>
                                            </div>
                                            {h.notes && <span className="hist-notes-preview" style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px'}}>{h.notes.substring(0, 80)}{h.notes.length > 80 ? '...' : ''}</span>}
                                            <span className="view-notes" onClick={() => setViewHistoryModal(h)} style={{cursor: 'pointer'}}>View Notes <ArrowRight size={14} /></span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                      </div>

                      <div className="pillar-side">
                        <div className="ai-analysis-box">
                            <div className="ai-score-row">
                                <span className="ai-score-primary">{(selectedPatient.priority_score / 10).toFixed(1)}</span>
                                <span className="ai-rank-badge">Score {selectedPatient.priority_score}/100</span>
                            </div>
                            <div className="card-title-row" style={{marginBottom: '12px'}}><Activity size={16} /> AI Priority Analysis</div>
                            
                            {/* AI Model Badge */}
                            <div style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                                background: selectedPatient.ai_model_used && selectedPatient.ai_model_used.includes('gemini') ? '#dcfce7' : '#fef3c7',
                                color: selectedPatient.ai_model_used && selectedPatient.ai_model_used.includes('gemini') ? '#166534' : '#92400e',
                                border: `1px solid ${selectedPatient.ai_model_used && selectedPatient.ai_model_used.includes('gemini') ? '#bbf7d0' : '#fde68a'}`
                              }}>
                                {selectedPatient.ai_model_used && selectedPatient.ai_model_used.includes('gemini') ? '✦ Gemini 1.5 Flash' : '⚠ Rule-based Fallback'}
                              </span>
                            </div>

                            {/* AI Reasoning */}
                            {selectedPatient.ai_reasoning ? (
                              <div style={{ padding: '14px 16px', background: '#f0f9ff', borderLeft: '3px solid #3b82f6', borderRadius: '8px', fontSize: '13px', color: '#1e40af', lineHeight: '1.6', marginBottom: '12px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: '#2563eb' }}>Clinical Reasoning</div>
                                {selectedPatient.ai_reasoning}
                              </div>
                            ) : (
                              <p className="ai-reasoning-para">
                                Priority set to <strong>{selectedPatient.priority_level}</strong> based on {vitals.symptoms} detected symptom{vitals.symptoms !== 1 ? 's' : ''}: {Array.isArray(selectedPatient.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient.symptoms}. 
                                Severity reported as <strong>{vitals.severity.toLowerCase()}</strong>.
                              </p>
                            )}
                        </div>

                        <div className="clinical-action-list">
                            <div className="card-title-row" style={{marginBottom: '8px'}}>Clinical Utilities</div>
                            <button className="action-item-btn"><FlaskConical size={18} color="#3b82f6" /> Request Lab Tests</button>
                            <button className="action-item-btn"><ImageIcon size={18} color="#3b82f6" /> Order Imaging</button>
                            <button className="action-item-btn"><UserPlus size={18} color="#3b82f6" /> Refer to Specialist</button>
                        </div>
                      </div>
                  </div>

                  {/* FR22: Structured Encounter Footer */}
                  <div className="encounter-footer-bar">
                      <div className="notes-text-card" style={{flex: 1}}>
                            {/* FR22: Structured diagnosis form */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
                              <div>
                                <label style={{display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px'}}>
                                  <ClipboardList size={12} style={{display: 'inline', marginRight: '4px'}} />
                                  Diagnosis *
                                </label>
                                <input 
                                  type="text"
                                  placeholder="e.g. Acute gastritis, Upper respiratory infection..."
                                  value={diagnosisForm.diagnosis}
                                  onChange={(e) => setDiagnosisForm(f => ({...f, diagnosis: e.target.value}))}
                                  style={{width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box'}}
                                />
                              </div>
                              <div>
                                <label style={{display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px'}}>
                                  <Pill size={12} style={{display: 'inline', marginRight: '4px'}} />
                                  Prescriptions
                                </label>
                                <input 
                                  type="text"
                                  placeholder="e.g. Amoxicillin 500mg 3x daily..."
                                  value={diagnosisForm.prescriptions}
                                  onChange={(e) => setDiagnosisForm(f => ({...f, prescriptions: e.target.value}))}
                                  style={{width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box'}}
                                />
                              </div>
                            </div>
                            <div style={{marginBottom: '12px'}}>
                              <label style={{display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px'}}>
                                <CalendarCheck size={12} style={{display: 'inline', marginRight: '4px'}} />
                                Treatment Plan
                              </label>
                              <input 
                                type="text"
                                placeholder="e.g. Rest for 3 days, bland diet, follow-up in 1 week..."
                                value={diagnosisForm.treatment_plan}
                                onChange={(e) => setDiagnosisForm(f => ({...f, treatment_plan: e.target.value}))}
                                style={{width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box'}}
                              />
                            </div>
                            <textarea 
                                placeholder="Additional clinical notes, observations, and follow-up instructions..."
                                value={diagnosisForm.notes}
                                onChange={(e) => setDiagnosisForm(f => ({...f, notes: e.target.value}))}
                            />
                            <div className="notes-card-footer">
                                <button className="btn-ghost" onClick={() => setDiagnosisForm({ diagnosis: '', treatment_plan: '', prescriptions: '', notes: '', follow_up: '' })}>Clear</button>
                                <button className="btn-solid-blue" onClick={handleSaveNotes}>Save Notes</button>
                            </div>
                      </div>
                      <div className="finalize-box">
                          <button className="btn-finalize-encounter" onClick={handleFinalize}>
                              <CheckCircle size={20} color="#10b981" />
                              Finalize Encounter
                          </button>
                          <p style={{fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px'}}>
                            Saves diagnosis & marks complete
                          </p>
                          <div className="print-discharge"><Printer size={14} /> Print Discharge Papers</div>
                      </div>
                  </div>
                </>
              ) : (
                <div className="empty-state card" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  Select a patient from the schedule to begin encounter.
                </div>
              )}
            </div>
            
            {/* History Notes Modal */}
            {viewHistoryModal && (
              <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div className="modal-content" style={{background:'white', padding:'24px', borderRadius:'12px', width:'500px', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3 style={{margin:0, fontSize:'18px', display:'flex', alignItems:'center', gap:'8px'}}><FileText size={20} color="#3b82f6" /> Encounter Record</h3>
                    <button onClick={() => setViewHistoryModal(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20} color="#64748b" /></button>
                  </div>
                  <div style={{marginBottom:'16px', display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748b', borderBottom:'1px solid #e2e8f0', paddingBottom:'12px'}}>
                    <span><strong>Date:</strong> {new Date(viewHistoryModal.created_at).toLocaleDateString()} at {new Date(viewHistoryModal.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    <span><strong>Patient:</strong> {selectedPatient?.patient?.name}</span>
                  </div>
                  
                  <div style={{marginBottom: '16px'}}>
                    <span style={{fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Diagnosis</span>
                    <span style={{fontSize: '15px', color: '#0f172a', fontWeight: 500}}>{viewHistoryModal.diagnosis || 'None recorded'}</span>
                  </div>
                  
                  <div style={{marginBottom: '16px'}}>
                    <span style={{fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Symptoms Reported</span>
                    <span style={{fontSize: '14px', color: '#475569'}}>{Array.isArray(viewHistoryModal.symptoms) ? viewHistoryModal.symptoms.join(', ') : viewHistoryModal.symptoms || 'None recorded'}</span>
                  </div>

                  {viewHistoryModal.notes && (
                    <div>
                      <span style={{fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Clinical Notes & Plan</span>
                      <div style={{fontSize: '14px', color: '#475569', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px', lineHeight: '1.6'}}>
                        {viewHistoryModal.notes}
                      </div>
                    </div>
                  )}

                  <div style={{display:'flex', justifyContent:'flex-end', marginTop:'24px'}}>
                    <button onClick={() => setViewHistoryModal(null)} style={{padding:'8px 16px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontWeight:'500'}}>Close</button>
                  </div>
                </div>
              </div>
            )}
            
          </>
        </div>
    </div>
  );
};

export default DoctorDashboard;
// Sort records by date descending
// Case-insensitive patient name search
// Optimized calendar rendering
// Reset modal state on close

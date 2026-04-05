import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertCircle, 
  Clock, 
  Zap, 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Target,
  Activity,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { appointmentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import './AIPriorityQueue.css';

const AIPriorityQueue = () => {
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const data = await appointmentService.fetchQueue();
      setQueue(data);
      if (data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePatient = (e, id) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div style={{ padding: '4px' }}>
          <p style={{ fontWeight: '600', margin: '0 0 12px 0' }}>Remove this patient from the queue?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await appointmentService.deleteAppointment(id);
                  toast.success('Patient removed from queue');
                  loadQueue();
                  if (selectedPatient?.id === id) setSelectedPatient(null);
                } catch (err) {
                  toast.error("Failed to remove patient: " + err.message);
                }
              }}
              style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              Remove
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleClearAll = () => {
    toast(
      (t) => (
        <div style={{ padding: '4px' }}>
          <p style={{ fontWeight: '600', color: '#dc2626', margin: '0 0 12px 0' }}>WARNING: Clear entire queue?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await appointmentService.clearAll();
                  toast.success('Queue cleared successfully');
                  loadQueue();
                  setSelectedPatient(null);
                } catch (err) {
                  toast.error("Failed to clear queue: " + err.message);
                }
              }}
              style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              Proceed
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const getAge = (dob) => {
    if (!dob) return 'N/A';
    const birth = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    return `${age}YRS`;
  };

  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'HIGH': return <span className="urgency-pill critical">Critical</span>;
      case 'MEDIUM': return <span className="urgency-pill urgent">Urgent</span>;
      default: return <span className="urgency-pill routine">Routine</span>;
    }
  };



  return (
    <div className="queue-page">
      {/* Title Area */}
      <div className="queue-title-header">
        <div className="title-left">
          <h1>AI Priority Queue</h1>
          <p>Real-time triage management powered by CareConnect AI.</p>
        </div>
        <div className="title-right">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input type="text" placeholder="Find patient..." />
          </div>
          <button className="icon-action-btn" onClick={handleClearAll} title="Reset All Queue">
            <RefreshCw size={18} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Queue</span>
            <span className="stat-number">{queue.length}</span>
          </div>
          <div className="stat-icon-wrapper blue">
            <Activity color="#3b82f6" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Critical Priority</span>
            <span className="stat-number">0{queue.filter(p => p.priority_level === 'HIGH').length}</span>
          </div>
          <div className="stat-icon-wrapper red">
            <AlertCircle color="#ef4444" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Avg. Wait Time</span>
            <span className="stat-number">14m</span>
          </div>
          <div className="stat-icon-wrapper gray">
            <Clock color="#64748b" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">AI Model</span>
            <span className="stat-number" style={{fontSize:'12px', fontWeight:600, color:'#10b981'}}>Gemini</span>
          </div>
          <div className="stat-icon-wrapper green">
            <Target color="#10b981" size={24} />
          </div>
        </div>
      </div>

      {/* Main Content: Table and Reasoning */}
      <div className="queue-main-layout">
        <div className="table-section card">
          <table className="priority-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>PATIENT</th>
                <th>AI SCORE</th>
                <th>URGENCY</th>
                <th>AI MODEL</th>
                <th>WAIT TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && queue.length === 0 ? (
                <tr><td colSpan={6} style={{padding:40}}><div className="skeleton-loader" style={{height:'40px', width:'100%', borderRadius:'8px', background:'#f1f5f9', animation:'pulse 1.5s infinite'}}></div></td></tr>
              ) : queue.map((appt, idx) => (
                <tr key={appt.id} className={selectedPatient?.id === appt.id ? 'active-row' : ''} onClick={() => setSelectedPatient(appt)}>
                  <td className="rank-cell">#{idx + 1}</td>
                  <td>
                    <div className="patient-cell">
                      <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${appt.patient?.name || 'User'}`} alt="" className="avatar-sm" />
                      <div className="patient-meta-info">
                        <div className="name">{appt.patient?.name}</div>
                        <div className="meta">PT-{appt.id * 100 + 50} • {getAge(appt.patient?.date_of_birth)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`score-badge score-${(appt.priority_level || 'LOW').toLowerCase()}`}>
                        {appt.priority_score}
                    </div>
                  </td>
                  <td>{getUrgencyBadge(appt.priority_level)}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                      background: appt.ai_model_used && appt.ai_model_used.includes('gemini') ? '#dcfce7' : '#fef3c7',
                      color: appt.ai_model_used && appt.ai_model_used.includes('gemini') ? '#166534' : '#92400e'
                    }}>
                      {appt.ai_model_used && appt.ai_model_used.includes('gemini') ? '✦ Gemini' : '⚠ Rules'}
                    </span>
                  </td>
                  <td className="time-cell"><Clock size={14} /> 0{idx + 4}m</td>
                  <td>
                    <button className="icon-action-btn" onClick={(e) => handleRemovePatient(e, appt.id)} title="Remove Patient">
                      <Trash2 size={16} color="#94a3b8" />
                    </button>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && !isLoading && (
                <tr><td colSpan={7} style={{textAlign:'center', color:'#94a3b8', padding:'40px'}}>The priority queue is empty.</td></tr>
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <div className="footer-info">Showing {queue.length} of {queue.length + 12} patients in active queue</div>
            <div className="pagination">
                <button className="pag-btn">Previous</button>
                <button className="pag-btn primary">Next Page</button>
            </div>
          </div>
          <div className="legend">
              <span className="legend-item"><span className="dot red"></span> 80-100: Immediate Action</span>
              <span className="legend-item"><span className="dot blue"></span> 50-79: Urgent Attention</span>
              <span className="legend-item"><span className="dot gray"></span> 0-49: Routine Review</span>
          </div>
        </div>

        {/* AI Reasoning Sidebar */}
        <div className="reasoning-sidebar card">
          {selectedPatient ? (
            <>
              <div className="sidebar-header">
                <span className="badge-red">Critical Analysis</span>
                <Zap className="zap-icon" size={18} />
              </div>
              <h2 className="sidebar-title">AI Reasoning</h2>
              <p className="sidebar-subtitle">Case #{selectedPatient.id + 8000} • {selectedPatient.patient?.name}</p>

              <div className="score-main-card">
                  <div className="score-circle-container">
                      <div className={`score-circular score-${selectedPatient.priority_level.toLowerCase()}`}>
                          {selectedPatient.priority_score}
                      </div>
                  </div>
                  <div className="score-text">
                      <div className="rank-text">Priority Ranking #1</div>
                      <div className="sub-text">Top 2% urgency percentile</div>
                  </div>
              </div>

              <div className="factors-section">
                  <h3 className="section-header-text"><Activity size={16} /> AI Triage Reasoning</h3>
                  {selectedPatient.ai_reasoning ? (
                    <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
                      {selectedPatient.ai_reasoning}
                    </div>
                  ) : (
                    <div className="factor-list">
                      {(selectedPatient.symptoms || []).slice(0, 4).map((s, i) => (
                        <div key={i} className="factor-row">
                          <span className="factor-label">{s}</span>
                          <span className="factor-weight">detected</span>
                        </div>
                      ))}
                      {(selectedPatient.symptoms || []).length === 0 && (
                        <p style={{color:'#94a3b8', fontSize:'13px'}}>No symptom details available.</p>
                      )}
                    </div>
                  )}
                  {selectedPatient.ai_model_used && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: selectedPatient.ai_model_used.includes('gemini') ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {selectedPatient.ai_model_used.includes('gemini') ? '✦ Gemini 1.5 Flash' : '⚠ Rule-based Fallback'}
                    </div>
                  )}
              </div>

              <div className="sidebar-actions">
                  <button className="btn-assign">Assign to Dr. Sarah Miller <ChevronRight size={16} /></button>
                  <button className="btn-escalate">Escalate to Trauma Team</button>
              </div>
            </>
          ) : (
            <div className="empty-reasoning">
                <p>Select a patient to view AI reasoning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPriorityQueue;

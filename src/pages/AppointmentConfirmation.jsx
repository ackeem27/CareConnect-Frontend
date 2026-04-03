import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, Calendar, Activity, Heart, Brain, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import './AppointmentConfirmation.css';

const AppointmentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  const appt = data.appointment || {};
  const advice = data.first_aid_advice || [];
  const aiReasoning = data.ai_reasoning || appt.ai_reasoning;
  const aiModelUsed = data.ai_model_used || appt.ai_model_used;

  const priorityColor = appt.priority_level === 'HIGH' ? '#ef4444' : appt.priority_level === 'MEDIUM' ? '#f59e0b' : '#10b981';
  const priorityLabel = appt.priority_level === 'HIGH' ? 'Critical' : appt.priority_level === 'MEDIUM' ? 'Urgent' : 'Routine';
  const scoreDisplay = appt.priority_score ? (appt.priority_score / 10).toFixed(1) : '0.0';
  const isGemini = aiModelUsed && (aiModelUsed.includes('gemini') || aiModelUsed === 'gemini-flash-latest');

  return (
    <div className="ac-wrapper">
      <header className="ac-nav">
        <Link to="/" className="ac-brand"><div className="ac-brand-icon"><Heart color="white" size={16} fill="white" /></div><span>CareConnect</span></Link>
        <nav className="ac-nav-links"><Link to="/">Emergency Info</Link><Link to="/patient">My Health</Link></nav>
      </header>

      <main className="ac-main">
        <div className="ac-success-icon"><CheckCircle size={56} color="#10b981" /></div>
        <h1 className="ac-title">Assessment Complete — Under Review</h1>
        <p className="ac-subtitle">Your symptoms have been analyzed by our AI triage system. The receptionist will finalize your schedule.</p>

        <div className="ac-receipt">
          <div className="ac-receipt-top">
            <div><h3>Appointment Receipt</h3><span className="ac-ref">Ref: CC-{appt.id ? `${appt.id}0031` : '992031'}-ILJ</span></div>
            <div className="ac-booking-date"><span className="ac-date-label">Booking Date</span><span className="ac-date-val">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
          </div>

          <div className="ac-priority-bar" style={{ borderLeftColor: priorityColor }}>
            <div className="ac-priority-left">
              <span className="ac-priority-tag" style={{ background: '#2563eb', color: 'white' }}>AI Priority Score</span>
              <span className="ac-score" style={{ color: '#2563eb' }}>{scoreDisplay}/10</span>
            </div>
            <span className="ac-status-badge" style={{ color: priorityColor, borderColor: priorityColor }}>Status: {priorityLabel}</span>
          </div>

          <div className="ac-priority-note">
            <Activity size={14} color="#64748b" />
            Based on your reported symptoms ({(appt.symptoms || []).join(', ')}), you have been assigned a {appt.priority_level?.toLowerCase() || 'routine'} priority. Your expected wait time upon arrival is less than 15 minutes.
          </div>
        </div>

        {/* ── AI Transparency Section ─────────────────── */}
        <div className="ac-ai-transparency">
          <div className="ac-ai-header">
            <Brain size={20} color="#3b82f6" />
            <div>
              <h3>AI Triage Analysis</h3>
              <p>Transparency report on how your case was analyzed</p>
            </div>
            <div className={`ac-model-badge ${isGemini ? 'gemini' : 'fallback'}`}>
              {isGemini ? (
                <><Sparkles size={12} /> Gemini 1.5 Flash</>
              ) : (
                <><AlertTriangle size={12} /> Rule-based Engine</>
              )}
            </div>
          </div>

          {aiReasoning && (
            <div className="ac-ai-reasoning">
              <div className="ac-reasoning-label"><ShieldCheck size={14} /> Clinical Reasoning</div>
              <p>{aiReasoning}</p>
            </div>
          )}

          <div className="ac-ai-details">
            <div className="ac-ai-detail">
              <span className="ac-detail-label">Priority Level</span>
              <span className="ac-detail-value" style={{ color: priorityColor, fontWeight: 800 }}>{appt.priority_level || '—'}</span>
            </div>
            <div className="ac-ai-detail">
              <span className="ac-detail-label">AI Score</span>
              <span className="ac-detail-value">{appt.priority_score || 0}/100</span>
            </div>
            <div className="ac-ai-detail">
              <span className="ac-detail-label">Detected Symptoms</span>
              <span className="ac-detail-value">{(appt.symptoms || []).length} identified</span>
            </div>
            <div className="ac-ai-detail">
              <span className="ac-detail-label">Model Used</span>
              <span className="ac-detail-value" style={{ fontSize: '12px', color: isGemini ? '#10b981' : '#f59e0b' }}>
                {isGemini ? 'Google Gemini 1.5 Flash (LLM)' : 'Rule-based Keyword Analysis'}
              </span>
            </div>
          </div>

          <div className="ac-ai-note">
            <Activity size={14} />
            <span>This analysis was performed automatically at the time of submission. A receptionist will review this AI recommendation before confirming your appointment schedule.</span>
          </div>
        </div>

        {advice && advice.length > 0 && (
          <div className="ac-advice-box">
            <h3 style={{fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
              <Activity size={20} color="#ef4444" />
              First Aid Guidance While You Wait
            </h3>
            <div className="ac-advice-grid" style={{textAlign: 'left', display: 'grid', gap: '12px'}}>
              {advice.map((item, idx) => (
                <div key={idx} style={{padding: '16px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '8px'}}>
                  <strong style={{color: '#991b1b', display: 'block', marginBottom: '4px'}}>{item.symptom}</strong>
                  <span style={{color: '#7f1d1d', fontSize: '14px'}}>{item.advice}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize: '12px', color: '#64748b', marginTop: '16px'}}>
              ⚠️ This is general first-aid guidance only — not a medical diagnosis. Always follow your doctor's instructions.
            </p>
          </div>
        )}

        <div className="ac-bottom-cards" style={{marginTop: '28px'}}>
          <button className="ac-bottom-card" onClick={() => navigate('/patient')}><Calendar size={20} color="#3b82f6" /><div><h4>Manage Appointments</h4><p>View your full health schedule</p></div></button>
          <button className="ac-bottom-card" onClick={() => navigate('/intake')}><Activity size={20} color="#ef4444" /><div><h4>Symptom Changes?</h4><p>Review emergency procedures</p></div></button>
        </div>

        <button className="ac-back" onClick={() => navigate('/')}>← Back to Home</button>
      </main>

      <footer className="ac-footer">© 2026 CareConnect Healthcare Systems. All rights reserved. <span>Privacy Policy</span> <span>Support Center</span> <span>System Status</span></footer>
    </div>
  );
};

export default AppointmentConfirmation;

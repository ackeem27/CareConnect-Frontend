import React, { useState, useEffect, useCallback } from 'react';
import { 
  FlaskConical, FileText, Clock, CheckCircle, User, Search, Send, Loader2, X, Activity, ClipboardCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, labService } from '../services/dataService';
import '../styles/LabDashboard.css';

const LabDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingLabs, setPendingLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsText, setResultsText] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await labService.fetchPendingLabs();
      setPendingLabs(data || []);
      
      setSelectedLab((current) => {
        if (!current) return current;
        const refreshed = data.find(l => l.id === current.id);
        if (!refreshed) {
          setResultsText('');
          setTestResults([]);
          setTechnicianNotes('');
        }
        return refreshed || null;
      });
    } catch (err) {
      console.error('Failed to load pending lab requests:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser() || { name: 'Lab Technologist', role: 'lab_technologist' };
    setCurrentUser(user);

    loadData(true);
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    if (!selectedLab) return;
    const completedRows = testResults.filter(row => row.done || row.result.trim() || row.notes.trim());
    const hasStructuredResults = completedRows.some(row => row.result.trim() || row.notes.trim());
    if (!resultsText.trim() && !hasStructuredResults && !technicianNotes.trim()) {
      toast.error('Please enter the laboratory findings/results.');
      return;
    }

    const structuredReport = [
      `Tests requested: ${selectedLab.tests}`,
      completedRows.length > 0 ? '\nTest findings:' : '',
      ...completedRows.map(row => {
        const status = row.done ? 'Completed' : 'Reviewed';
        const result = row.result.trim() || 'No numeric/value result entered';
        const notes = row.notes.trim() ? ` Notes: ${row.notes.trim()}` : '';
        return `- ${row.name}: ${status}. Result: ${result}.${notes}`;
      }),
      resultsText.trim() ? `\nSummary report:\n${resultsText.trim()}` : '',
      technicianNotes.trim() ? `\nTechnician notes:\n${technicianNotes.trim()}` : ''
    ].filter(Boolean).join('\n');

    setSubmitting(true);
    try {
      await labService.submitLabResults(selectedLab.id, structuredReport);
      toast.success(`Lab results for ${selectedLab.patient_name} submitted successfully!`);
      setResultsText('');
      setTestResults([]);
      setTechnicianNotes('');
      setSelectedLab(null);
      setCompletedToday(prev => prev + 1);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit lab results');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLabs = pendingLabs.filter(lab => 
    lab.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.tests?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatientAge = (lab) => {
    return lab.patient_age || '—';
  };

  const getFormattedTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString() + ')';
  };

  const parseTests = (tests) => {
    if (!tests) return [];
    return String(tests).split(',').map(test => test.trim()).filter(Boolean);
  };

  const selectLab = (lab) => {
    setSelectedLab(lab);
    setResultsText(lab.results || '');
    setTechnicianNotes('');
    setTestResults(parseTests(lab.tests).map(test => ({
      name: test,
      done: false,
      result: '',
      notes: ''
    })));
  };

  const updateTestRow = (index, patch) => {
    setTestResults(prev => prev.map((row, rowIndex) => (
      rowIndex === index ? { ...row, ...patch } : row
    )));
  };

  return (
    <div className="lab-dashboard-wrapper">
      {/* Header bar */}
      <div className="lab-header">
        <div className="lab-header-left">
          <div className="lab-logo-icon">
            <FlaskConical size={24} color="white" />
          </div>
          <div>
            <h1>Pathology Laboratory</h1>
            <p>CareConnect Diagnostics Hub • Welcome, <strong>{currentUser?.name || 'Practitioner'}</strong></p>
          </div>
        </div>
        <div className="lab-header-right">
          <div className="lab-date-badge">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="lab-stats-grid">
        <div className="lab-stat-card border-blue">
          <div className="lab-stat-info">
            <span className="lab-stat-label">Pending Pathology</span>
            <span className="lab-stat-number">{pendingLabs.length}</span>
          </div>
          <div className="lab-stat-icon-wrap bg-blue">
            <Activity size={24} color="#3b82f6" />
          </div>
        </div>
        <div className="lab-stat-card border-orange">
          <div className="lab-stat-info">
            <span className="lab-stat-label">In Analysis</span>
            <span className="lab-stat-number">{selectedLab ? 1 : 0}</span>
          </div>
          <div className="lab-stat-icon-wrap bg-orange">
            <Loader2 className={selectedLab ? "spin" : ""} size={24} color="#f59e0b" />
          </div>
        </div>
        <div className="lab-stat-card border-emerald">
          <div className="lab-stat-info">
            <span className="lab-stat-label">Completed Today</span>
            <span className="lab-stat-number">{completedToday}</span>
          </div>
          <div className="lab-stat-icon-wrap bg-emerald">
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="lab-content-grid">
        {/* Left Column: Pending Queue */}
        <div className="lab-queue-card">
          <div className="lab-card-header">
            <h2><FileText size={18} /> Active Pathology Queue</h2>
            <div className="lab-search-input">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search patient or test..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="lab-queue-list">
            {loading && pendingLabs.length === 0 ? (
              <div className="lab-loading-state">
                <Loader2 className="spin" size={32} color="#3b82f6" />
                <p>Loading pathology requests...</p>
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="lab-empty-state">
                <FlaskConical size={40} color="#94a3b8" />
                <p>{searchQuery ? "No matching requests found." : "No pending pathology requests."}</p>
              </div>
            ) : (
              filteredLabs.map(lab => (
                <div 
                  key={lab.id} 
                  className={`lab-queue-item ${selectedLab?.id === lab.id ? 'active' : ''}`}
                  onClick={() => selectLab(lab)}
                >
                  <div className="lab-item-header">
                    <div className="lab-patient-identity">
                      <div className="lab-avatar-mini">
                        <User size={14} color="#64748b" />
                      </div>
                      <h3>{lab.patient_name}</h3>
                    </div>
                    <span className="lab-time-badge">
                      <Clock size={11} /> {new Date(lab.requested_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="lab-item-body">
                    <span className="lab-age-pill">Age: {getPatientAge(lab)}</span>
                    <span className="lab-tests-preview">Tests: <strong>{lab.tests}</strong></span>
                  </div>
                  {lab.symptoms && (
                    <div className="lab-item-symptoms">
                      <strong>Symptoms:</strong> {lab.symptoms}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Processing Board */}
        <div className="lab-details-card">
          {selectedLab ? (
            <form onSubmit={handleSubmitResults} className="lab-details-form">
              <div className="lab-details-header">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <FlaskConical size={20} color="#3b82f6" />
                  <h2>Specimen & Pathology Form</h2>
                </div>
                <button 
                  type="button" 
                  className="lab-deselect-btn"
                  onClick={() => {
                    setSelectedLab(null);
                    setResultsText('');
                    setTestResults([]);
                    setTechnicianNotes('');
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="lab-patient-profile-sheet">
                <div className="lab-sheet-row">
                  <div className="lab-sheet-cell">
                    <span className="lab-sheet-label">Patient Name</span>
                    <span className="lab-sheet-val">{selectedLab.patient_name}</span>
                  </div>
                  <div className="lab-sheet-cell">
                    <span className="lab-sheet-label">Age</span>
                    <span className="lab-sheet-val">{getPatientAge(selectedLab)} Years</span>
                  </div>
                </div>
                <div className="lab-sheet-row">
                  <div className="lab-sheet-cell">
                    <span className="lab-sheet-label">Requested At</span>
                    <span className="lab-sheet-val">{getFormattedTime(selectedLab.requested_at)}</span>
                  </div>
                  <div className="lab-sheet-cell">
                    <span className="lab-sheet-label">Intake Symptoms</span>
                    <span className="lab-sheet-val text-italic">{selectedLab.symptoms || 'None recorded'}</span>
                  </div>
                </div>
                <div className="lab-sheet-tests-box">
                  <span className="lab-sheet-label">Pathology Tests Required</span>
                  <div className="lab-required-tests-list">
                    {parseTests(selectedLab.tests).map(test => (
                      <span key={test} className="lab-required-tests-bubble">{test}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lab-test-worklist">
                <div className="lab-worklist-title">
                  <ClipboardCheck size={15} /> Test processing checklist
                </div>
                {testResults.map((row, index) => (
                  <div key={row.name} className={`lab-test-result-row ${row.done ? 'checked' : ''}`}>
                    <label className="lab-test-check">
                      <input
                        type="checkbox"
                        checked={row.done}
                        onChange={e => updateTestRow(index, { done: e.target.checked })}
                      />
                      <span>{row.name}</span>
                    </label>
                    <input
                      className="lab-result-value"
                      value={row.result}
                      onChange={e => updateTestRow(index, { result: e.target.value })}
                      placeholder="Result/value"
                    />
                    <input
                      className="lab-result-note"
                      value={row.notes}
                      onChange={e => updateTestRow(index, { notes: e.target.value })}
                      placeholder="Reference range, flag, or note"
                    />
                  </div>
                ))}
              </div>

              <div className="lab-results-input-group">
                <label htmlFor="lab-results-textarea">
                  <FileText size={14} /> Summary Findings & Report
                </label>
                <textarea
                  id="lab-results-textarea"
                  value={resultsText}
                  onChange={e => setResultsText(e.target.value)}
                  placeholder="Enter detailed test results, counts, parameters, and technician notes..."
                />
              </div>

              <div className="lab-results-input-group">
                <label htmlFor="lab-notes-textarea">
                  <FileText size={14} /> Technician Notes
                </label>
                <textarea
                  id="lab-notes-textarea"
                  className="lab-notes-textarea"
                  value={technicianNotes}
                  onChange={e => setTechnicianNotes(e.target.value)}
                  placeholder="Specimen quality, collection issues, urgent comments, or doctor follow-up notes..."
                />
              </div>

              <div className="lab-details-actions">
                <button 
                  type="button" 
                  className="lab-btn-secondary"
                  onClick={() => {
                    setSelectedLab(null);
                    setResultsText('');
                    setTestResults([]);
                    setTechnicianNotes('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="lab-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="spin" size={16} />
                      <span>Submitting Findings...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Lab Results</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="lab-details-empty">
              <div className="lab-empty-illustration">
                <FlaskConical size={64} className="pulse-slow" />
              </div>
              <h3>No Specimen Selected</h3>
              <p>Select an active pathology request from the queue on the left to begin specimen processing, analyze metrics, and submit findings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;

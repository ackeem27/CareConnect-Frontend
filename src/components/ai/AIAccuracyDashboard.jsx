import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Target, 
  Brain, 
  Play, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  HeartPulse
} from 'lucide-react';
import { aiEvaluationService } from '../../services/dataService';
import './AIAccuracyDashboard.css';

const AIAccuracyDashboard = () => {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCase, setExpandedCase] = useState(null);

  // Live single test
  const [singleTest, setSingleTest] = useState({
    symptoms: '',
    severity: 'low',
    age: '',
    chronic_conditions: ''
  });
  const [singleResult, setSingleResult] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);

  const runEvaluation = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await aiEvaluationService.runTestCases();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to run evaluation');
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async () => {
    if (!singleTest.symptoms.trim()) return;
    setSingleLoading(true);
    setSingleResult(null);
    try {
      const data = await aiEvaluationService.runSingleTest(
        singleTest.symptoms,
        singleTest.severity,
        singleTest.age ? parseInt(singleTest.age) : null,
        singleTest.chronic_conditions ? singleTest.chronic_conditions.split(',').map(c => c.trim()).filter(Boolean) : []
      );
      setSingleResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div className="ai-eval-page">
      {/* Hero Header */}
      <div className="ai-eval-hero">
        <div className="ai-eval-hero-content">
          <div className="ai-eval-badge">
            <FlaskConical size={14} />
            AI Model Validation Suite
          </div>
          <h1>AI Triage Accuracy Evaluation</h1>
          <p>
            Run 15 clinically-sourced test scenarios through our Gemini 1.5 Flash triage model in real-time. 
            Each case includes patient context (age, chronic conditions, visit history) to validate context-aware analysis.
          </p>
          <button className="ai-eval-run-btn" onClick={runEvaluation} disabled={isRunning}>
            {isRunning ? (
              <><Loader2 size={18} className="spin" /> Running Evaluation...</>
            ) : (
              <><Play size={18} /> Run Full Evaluation ({15} Cases)</>
            )}
          </button>
        </div>
        <div className="ai-eval-hero-visual">
          <div className="ai-eval-model-card">
            <div className="model-card-header">
              <Sparkles size={20} color="#10b981" />
              <span>Active AI Model</span>
            </div>
            <h3>Google Gemini 1.5 Flash</h3>
            <div className="model-specs">
              <div className="spec-row"><span>Type</span><span>Large Language Model (LLM)</span></div>
              <div className="spec-row"><span>Purpose</span><span>OPD Triage Classification</span></div>
              <div className="spec-row"><span>Temp</span><span>0.1 (Deterministic)</span></div>
              <div className="spec-row"><span>Fallback</span><span>Rule-based keyword engine</span></div>
              <div className="spec-row"><span>Context</span><span>Age, Conditions, Visit Hx</span></div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="ai-eval-error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <>
          <div className="ai-eval-summary-grid">
            <div className="eval-summary-card accuracy-card">
              <div className="summary-icon-ring" style={{ background: results.accuracy >= 80 ? '#dcfce7' : '#fef3c7' }}>
                <Target size={24} color={results.accuracy >= 80 ? '#16a34a' : '#d97706'} />
              </div>
              <div className="summary-text">
                <span className="summary-label">Model Accuracy</span>
                <span className="summary-value" style={{ color: results.accuracy >= 80 ? '#16a34a' : '#d97706' }}>
                  {results.accuracy}%
                </span>
              </div>
            </div>
            <div className="eval-summary-card">
              <div className="summary-icon-ring" style={{ background: '#dbeafe' }}>
                <CheckCircle size={24} color="#2563eb" />
              </div>
              <div className="summary-text">
                <span className="summary-label">Correct Classifications</span>
                <span className="summary-value">{results.correct}/{results.total_cases}</span>
              </div>
            </div>
            <div className="eval-summary-card">
              <div className="summary-icon-ring" style={{ background: '#f3e8ff' }}>
                <Brain size={24} color="#7c3aed" />
              </div>
              <div className="summary-text">
                <span className="summary-label">AI Model Used</span>
                <span className="summary-value" style={{ fontSize: '13px' }}>
                  {results.ai_model && results.ai_model.includes('gemini') ? '✦ Gemini Flash' : results.ai_model === 'rule_based_fallback' ? '⚠ Rule-based' : results.ai_model}
                </span>
              </div>
            </div>
            <div className="eval-summary-card">
              <div className="summary-icon-ring" style={{ background: '#fce7f3' }}>
                <Activity size={24} color="#db2777" />
              </div>
              <div className="summary-text">
                <span className="summary-label">Evaluated At</span>
                <span className="summary-value" style={{ fontSize: '12px' }}>
                  {new Date(results.evaluated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="ai-eval-results-card">
            <div className="results-card-header">
              <h3><ShieldCheck size={18} /> Test Case Results</h3>
              <span className="results-sub">Each scenario is run live through the AI model</span>
            </div>
            <table className="ai-eval-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scenario</th>
                  <th>Patient Context</th>
                  <th>Expected</th>
                  <th>AI Output</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr className={r.correct ? 'row-correct' : 'row-incorrect'} onClick={() => setExpandedCase(expandedCase === r.id ? null : r.id)}>
                      <td className="case-id">{r.id}</td>
                      <td className="scenario-cell">{r.scenario}</td>
                      <td className="context-cell">
                        <span className="context-tag">{r.age}y</span>
                        <span className="context-tag">{r.severity}</span>
                        {(r.chronic_conditions || []).map((c, i) => (
                          <span key={i} className="context-tag chronic">{c}</span>
                        ))}
                      </td>
                      <td><span className="priority-badge" style={{ background: getPriorityColor(r.expected_level) + '18', color: getPriorityColor(r.expected_level), borderColor: getPriorityColor(r.expected_level) }}>{r.expected_level}</span></td>
                      <td><span className="priority-badge" style={{ background: getPriorityColor(r.actual_level) + '18', color: getPriorityColor(r.actual_level), borderColor: getPriorityColor(r.actual_level) }}>{r.actual_level}</span></td>
                      <td className="score-cell">{r.actual_score}/100</td>
                      <td>
                        {r.correct ? (
                          <span className="result-badge correct"><CheckCircle size={14} /> Pass</span>
                        ) : (
                          <span className="result-badge incorrect"><XCircle size={14} /> Fail</span>
                        )}
                      </td>
                      <td>
                        <button className="expand-btn">
                          {expandedCase === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {expandedCase === r.id && (
                      <tr className="expanded-row">
                        <td colSpan={8}>
                          <div className="expanded-content">
                            <div className="expanded-grid">
                              <div className="expanded-section">
                                <h4><Activity size={14} /> Symptoms Sent</h4>
                                <p>{r.symptoms}</p>
                              </div>
                              <div className="expanded-section">
                                <h4><Brain size={14} /> Detected by AI</h4>
                                <div className="tag-list">
                                  {(r.detected_symptoms || []).map((s, i) => (
                                    <span key={i} className="detected-tag">{s}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {r.ai_reasoning && (
                              <div className="ai-reasoning-box">
                                <h4><Zap size={14} /> AI Reasoning</h4>
                                <p>{r.ai_reasoning}</p>
                              </div>
                            )}
                            <div className="model-tag-row">
                                <span className={`model-tag ${r.ai_model_used && r.ai_model_used.includes('gemini') ? 'gemini' : 'fallback'}`}>
                                  {r.ai_model_used && r.ai_model_used.includes('gemini') ? '✦ Gemini 1.5 Flash' : '⚠ Rule-based Fallback'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Live Single Test */}
      <div className="ai-eval-live-test">
        <div className="live-test-header">
          <HeartPulse size={20} color="#3b82f6" />
          <div>
            <h3>Live AI Triage Demo</h3>
            <p>Enter any symptoms and patient context to see the AI triage in real-time.</p>
          </div>
        </div>
        <div className="live-test-form">
          <div className="live-field">
            <label>Symptoms</label>
            <textarea
              placeholder="e.g. chest pain, difficulty breathing, dizziness..."
              value={singleTest.symptoms}
              onChange={e => setSingleTest(s => ({ ...s, symptoms: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="live-field-row">
            <div className="live-field">
              <label>Age</label>
              <input type="number" placeholder="e.g. 65" value={singleTest.age} onChange={e => setSingleTest(s => ({ ...s, age: e.target.value }))} />
            </div>
            <div className="live-field">
              <label>Severity</label>
              <select value={singleTest.severity} onChange={e => setSingleTest(s => ({ ...s, severity: e.target.value }))}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="live-field">
              <label>Chronic Conditions</label>
              <input type="text" placeholder="e.g. diabetes, hypertension" value={singleTest.chronic_conditions} onChange={e => setSingleTest(s => ({ ...s, chronic_conditions: e.target.value }))} />
            </div>
          </div>
          <button className="live-test-btn" onClick={runSingleTest} disabled={singleLoading || !singleTest.symptoms.trim()}>
            {singleLoading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><Zap size={16} /> Run AI Triage</>}
          </button>
        </div>

        {singleResult && (
          <div className="live-test-result">
            <div className="live-result-header">
              <div className="live-result-priority" style={{ background: getPriorityColor(singleResult.output.priority_level) }}>
                {singleResult.output.priority_level}
              </div>
              <div className="live-result-score">
                <span className="score-big">{singleResult.output.priority_score}</span>
                <span className="score-label">/100</span>
              </div>
            </div>
            {singleResult.output.reasoning && (
              <div className="live-reasoning">
                <h4><Brain size={14} /> AI Reasoning</h4>
                <p>{singleResult.output.reasoning}</p>
              </div>
            )}
            <div className="live-details">
              <div className="live-detail">
                <span className="ld-label">Detected</span>
                <span className="ld-value">{(singleResult.output.detected_symptoms || []).join(', ')}</span>
              </div>
              <div className="live-detail">
                <span className="ld-label">Model</span>
                <span className="ld-value" style={{ color: singleResult.output.ai_model_used && singleResult.output.ai_model_used.includes('gemini') ? '#10b981' : '#f59e0b' }}>
                  {singleResult.output.ai_model_used && singleResult.output.ai_model_used.includes('gemini') ? '✦ Gemini 1.5 Flash' : '⚠ Rule-based Fallback'}
                </span>
              </div>
            </div>
            {singleResult.output.first_aid_advice && singleResult.output.first_aid_advice.length > 0 && (
              <div className="live-first-aid">
                <h4>First Aid Advice</h4>
                {singleResult.output.first_aid_advice.map((a, i) => (
                  <div key={i} className="fa-item">
                    <strong>{a.symptom}:</strong> {a.advice}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAccuracyDashboard;
// Chart re-render on data update
// Display: Gemini 1.5 Flash

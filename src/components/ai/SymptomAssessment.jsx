import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  Activity, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { appointmentService } from '../../services/dataService';
import './SymptomAssessment.css';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Chest Pain', 'Shortness of Breath', 'Headache', 
  'Nausea', 'Dizziness', 'Abdominal Pain', 'Fatigue', 'Sore Throat', 
  'Muscle Ache', 'Skin Rash'
];

const SymptomAssessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [severity, setSeverity] = useState('low');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allSymptoms = [...selectedSymptoms];
      if (otherSymptoms.trim()) allSymptoms.push(otherSymptoms.trim());
      
      const symptomsString = allSymptoms.join(', ');
      // Severity is gathered in Step 2 usually, but for now we'll use the state
      const res = await appointmentService.createAppointment(symptomsString, severity);
      navigate('/appointment-confirmed', { state: res });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="assessment-container">
      {/* Header */}
      <header className="assessment-header">
        <div className="header-left">
          <div className="logo">
            <HeartPulse color="#3b82f6" size={28} strokeWidth={2.5} />
            <span className="logo-text">CareConnect</span>
          </div>
          <nav className="header-nav">
            <button className="nav-item">Emergency Info</button>
            <button className="nav-item">My Health</button>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search patients..." />
          </div>
          <button className="icon-btn"><Bell size={20} /></button>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?background=random&color=fff&name=doctor_1" alt="Profile" />
            <div className="status-dot"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="assessment-main">
        <div className="assessment-top">
          <div className="badge">Triage Intake Portal</div>
          <h1 className="assessment-title">Symptom Assessment</h1>
          <p className="assessment-subtitle">
            Tell us how you're feeling. Our AI will prioritize your case so our team can prepare for your visit.
          </p>
        </div>

        {/* Stepper */}
        <div className="assessment-stepper">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Symptoms</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Details</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="assessment-card"
            >
              <div className="card-header">
                <div className="card-icon-box">
                  <Activity size={24} color="#3b82f6" />
                </div>
                <div>
                  <h2>What are your symptoms?</h2>
                  <p>Select all that apply to your current condition.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="symptom-section">
                  <h3 className="section-title">Common Symptoms</h3>
                  <div className="symptom-pills">
                    {COMMON_SYMPTOMS.map(s => (
                      <button 
                        key={s} 
                        className={`symptom-pill ${selectedSymptoms.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleSymptom(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="symptom-section">
                  <h3 className="section-title">Other (Optional)</h3>
                  <input 
                    type="text" 
                    className="assessment-input" 
                    placeholder="e.g. Earache, lower back pain..." 
                    value={otherSymptoms}
                    onChange={(e) => setOtherSymptoms(e.target.value)}
                  />
                </div>

                <div className="privacy-notice">
                  <Info size={18} />
                  <div>
                    <strong>Privacy Notice</strong>
                    <p>Your symptom data is encrypted and only visible to authorized clinical staff during your appointment.</p>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button className="btn-secondary" disabled>
                  <ChevronLeft size={18} /> Previous
                </button>
                <button className="btn-primary" onClick={() => setStep(2)}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="assessment-card"
            >
              <div className="card-header">
                <div className="card-icon-box">
                  <AlertCircle size={24} color="#3b82f6" />
                </div>
                <div>
                  <h2>Additional Details</h2>
                  <p>Help us understand the severity and duration.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="symptom-section">
                  <h3 className="section-title">How severe is your discomfort?</h3>
                  <div className="severity-selector">
                    {['low', 'moderate', 'severe'].map(s => (
                      <button 
                        key={s} 
                        className={`severity-btn ${severity === s ? 'active' : ''}`}
                        onClick={() => setSeverity(s)}
                      >
                        <div className="severity-icon">
                          {s === 'low' ? '😌' : s === 'moderate' ? '😟' : '😰'}
                        </div>
                        <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  <ChevronLeft size={18} /> Previous
                </button>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="assessment-card"
            >
              <div className="card-header">
                <div className="card-icon-box">
                  <CheckCircle2 size={24} color="#3b82f6" />
                </div>
                <div>
                  <h2>Review Assessment</h2>
                  <p>Confirm your details before submitting to triage.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="review-item">
                  <span className="review-label">Selected Symptoms</span>
                  <div className="review-value">
                    {selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected'}
                    {otherSymptoms && `, ${otherSymptoms}`}
                  </div>
                </div>
                <div className="review-item">
                  <span className="review-label">Severity Level</span>
                  <div className="review-value capitalize">{severity}</div>
                </div>

                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="card-footer">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  <ChevronLeft size={18} /> Previous
                </button>
                <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Assessment'} <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Info Grid */}
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon info-blue">
              <Info size={18} />
            </div>
            <div>
              <h3>Emergency?</h3>
              <p>If this is a life-threatening emergency, call 911 immediately.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon info-green">
              <Zap size={18} />
            </div>
            <div>
              <h3>Smart Queue</h3>
              <p>Our AI ensures urgent cases are seen first, regardless of arrival order.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon info-blue-light">
              <Stethoscope size={18} />
            </div>
            <div>
              <h3>Care Prep</h3>
              <p>Doctors review your data before walking into the room.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="assessment-footer">
        <div className="footer-left">
          © 2024 CareConnect Systems. All rights reserved.
        </div>
        <div className="footer-right">
          <button>Privacy Policy</button>
          <button>Support Center</button>
          <button>System Status</button>
        </div>
      </footer>
    </div>
  );
};

export default SymptomAssessment;

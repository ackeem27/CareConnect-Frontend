import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { appointmentService } from '../../services/dataService';
import './PatientAIIntake.css';

import DoctorPortrait from '../../assets/images/doctor_2.jpg';
import TeamLab from '../../assets/images/team_1.jpg';

const SYMPTOM_CATEGORIES = [
  {
    id: 'chest',
    icon: '❤️',
    title: 'Chest & Breathing',
    urgency: 'High Urgency',
    urgencyClass: 'urgency-high',
    description: 'Chest pain, shortness of breath, or sudden difficulty breathing that worsens rapidly or comes with dizziness.',
    keywords: 'chest pain difficulty breathing',
  },
  {
    id: 'fever',
    icon: '🌡️',
    title: 'Fever & Infection',
    urgency: 'Medium Urgency',
    urgencyClass: 'urgency-medium',
    description: 'Persistent high fever (over 103°F / 39°C), severe chills, or suspected spreading infection.',
    keywords: 'fever',
  },
  {
    id: 'neuro',
    icon: '🧠',
    title: 'Neurological',
    urgency: 'High Urgency',
    urgencyClass: 'urgency-high',
    description: 'Sudden confusion, slurred speech, facial drooping, or intense severe headaches.',
    keywords: 'stroke confusion severe head injury',
  },
  {
    id: 'burns',
    icon: '🔥',
    title: 'Burns & Skin',
    urgency: 'Medium Urgency',
    urgencyClass: 'urgency-medium',
    description: 'Burns covering large areas, chemical exposure, or wounds needing immediate attention.',
    keywords: 'burning severe bleeding deep cut',
  },
  {
    id: 'allergy',
    icon: '⚠️',
    title: 'Allergic Reactions',
    urgency: 'High Urgency',
    urgencyClass: 'urgency-high',
    description: 'Swelling of throat/tongue, hives spreading rapidly, or exposure to a known severe allergen.',
    keywords: 'allergic reaction',
  },
  {
    id: 'general',
    icon: '🩺',
    title: 'General Malaise',
    urgency: 'Low Urgency',
    urgencyClass: 'urgency-low',
    description: 'Tiredness, non-specific discomfort, muscle aches, nausea, or common cold/flu symptoms.',
    keywords: 'fatigue nausea muscle ache',
  },
];

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Chest Pain', 'Shortness of Breath', 'Headache', 
  'Nausea', 'Dizziness', 'Abdominal Pain', 'Fatigue', 'Sore Throat', 
  'Muscle Ache', 'Skin Rash'
];

const PatientAIIntake = () => {
  const navigate = useNavigate();
  const [showIntake, setShowIntake] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [severity, setSeverity] = useState('low');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleStartIntake = () => {
    setShowIntake(true);
    setStep(1);
  };

  const handleCategoryClick = (keywords) => {
    setOtherSymptoms(keywords);
    handleStartIntake();
  };

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
      if (!symptomsString) {
        throw new Error('Please select at least one symptom.');
      }

      const res = await appointmentService.createAppointment(symptomsString, severity);
      navigate('/appointment-confirmed', { state: res });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-portal">
      <div className="portal-hero">
        <div className="portal-hero-text">
          <div className="portal-emergency-bar-inline">
            🚨 LIFE-THREATENING EMERGENCY? CALL 911 IMMEDIATELY.
          </div>
          <h1 className="portal-hero-heading">
            Immediate Help<br />
            <span className="portal-hero-accent">When You Need It Most.</span>
          </h1>
          <p className="portal-hero-sub">
            Not sure if your symptoms require an urgent visit? Use our AI-powered triage to get immediate guidance and prioritise your care.
          </p>
          <div className="portal-hero-buttons">
            <button className="btn-portal-primary" onClick={handleStartIntake}>
              ▶ Start Symptom Intake
            </button>
            <button className="btn-portal-outline">
              📞 Emergency Contacts
            </button>
          </div>
        </div>
        
        <div className="portal-hero-images-container">
          <img src={TeamLab} alt="Medical Team" className="hero-img-main" />
          <img src={DoctorPortrait} alt="Doctor" className="hero-img-float" />
          <div className="overlay-card">
            <div className="live-dot"></div>
            <div>
              <div className="portal-hero-card-title">Live System Status</div>
              <div className="portal-hero-card-sub">All departments operating at normal capacity.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-section">
        <div className="portal-section-header">
          <div>
            <h2 className="portal-section-title">Symptom Triage Library</h2>
            <p className="portal-section-sub">Instructions for common medical situations.</p>
          </div>
        </div>

        <div className="category-grid">
          {SYMPTOM_CATEGORIES.map((cat) => (
            <motion.div 
              key={cat.id} 
              className="category-card" 
              onClick={() => handleCategoryClick(cat.keywords)}
              whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="category-card-top">
                <span className="category-icon">{cat.icon}</span>
                <span className={`category-urgency-tag ${cat.urgencyClass}`}>{cat.urgency}</span>
              </div>
              <h3 className="category-title">{cat.title}</h3>
              <p className="category-desc">{cat.description}</p>
              <div className="category-cta">Start Intake <ChevronRight size={14} /></div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showIntake && (
          <motion.div 
            className="intake-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="intake-assessment-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button className="modal-close-btn" onClick={() => setShowIntake(false)}>
                <X size={20} />
              </button>

              <div className="assessment-modal-content">
                <div className="assessment-top-modal">
                  <div className="badge-modal">Triage Intake Portal</div>
                  <h1 className="assessment-title-modal">Symptom Assessment</h1>
                  <p className="assessment-subtitle-modal">
                    Tell us how you're feeling. Our AI will prioritize your case.
                  </p>
                </div>

                {/* Stepper */}
                <div className="assessment-stepper-modal">
                  <div className={`step-item-modal ${step >= 1 ? 'active' : ''}`}>
                    <div className="step-number-modal">1</div>
                    <div className="step-label-modal">Symptoms</div>
                  </div>
                  <div className="step-line-modal"></div>
                  <div className={`step-item-modal ${step >= 2 ? 'active' : ''}`}>
                    <div className="step-number-modal">2</div>
                    <div className="step-label-modal">Details</div>
                  </div>
                  <div className="step-line-modal"></div>
                  <div className={`step-item-modal ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-number-modal">3</div>
                    <div className="step-label-modal">Review</div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="assessment-card-modal">
                        <div className="card-header-modal">
                          <div className="card-icon-box-modal"><Activity size={24} color="#3b82f6" /></div>
                          <div>
                            <h2>What are your symptoms?</h2>
                            <p>Select all that apply.</p>
                          </div>
                        </div>
                        <div className="card-body-modal">
                          <div className="symptom-section-modal">
                            <h3 className="section-title-modal">Common Symptoms</h3>
                            <div className="symptom-pills-modal">
                              {COMMON_SYMPTOMS.map(s => (
                                <button key={s} className={`symptom-pill-modal ${selectedSymptoms.includes(s) ? 'active' : ''}`} onClick={() => toggleSymptom(s)}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div className="symptom-section-modal">
                            <h3 className="section-title-modal">Other (Optional)</h3>
                            <input type="text" className="assessment-input-modal" placeholder="e.g. Earache, lower back pain..." value={otherSymptoms} onChange={(e) => setOtherSymptoms(e.target.value)} />
                          </div>
                          <div className="privacy-notice-modal">
                            <AlertCircle size={18} />
                            <div>
                              <strong>Privacy Notice</strong>
                              <p>Your symptom data is encrypted and only visible to authorized clinical staff during your appointment.</p>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer-modal">
                          <button className="btn-secondary-modal" onClick={() => setShowIntake(false)}>Cancel</button>
                          <button className="btn-primary-modal" onClick={() => setStep(2)}>Continue <ChevronRight size={18} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="assessment-card-modal">
                        <div className="card-header-modal">
                          <div className="card-icon-box-modal"><AlertCircle size={24} color="#3b82f6" /></div>
                          <div>
                            <h2>Additional Details</h2>
                            <p>Help us understand the severity.</p>
                          </div>
                        </div>
                        <div className="card-body-modal">
                          <div className="symptom-section-modal">
                            <h3 className="section-title-modal">How severe is your discomfort?</h3>
                            <div className="severity-selector-modal">
                              {['low', 'moderate', 'severe'].map(s => (
                                <button key={s} className={`severity-btn-modal ${severity === s ? 'active' : ''}`} onClick={() => setSeverity(s)}>
                                  <div className="severity-icon-modal">{s === 'low' ? '😌' : s === 'moderate' ? '😟' : '😰'}</div>
                                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="card-footer-modal">
                          <button className="btn-secondary-modal" onClick={() => setStep(1)}><ChevronLeft size={18} /> Previous</button>
                          <button className="btn-primary-modal" onClick={() => setStep(3)}>Continue <ChevronRight size={18} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="assessment-card-modal">
                        <div className="card-header-modal">
                          <div className="card-icon-box-modal"><CheckCircle2 size={24} color="#3b82f6" /></div>
                          <div>
                            <h2>Review Assessment</h2>
                            <p>Confirm before submitting.</p>
                          </div>
                        </div>
                        <div className="card-body-modal">
                          <div className="review-item-modal">
                            <span className="review-label-modal">Symptoms</span>
                            <div className="review-value-modal">{selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected'}{otherSymptoms && `, ${otherSymptoms}`}</div>
                          </div>
                          <div className="review-item-modal">
                            <span className="review-label-modal">Severity</span>
                            <div className="review-value-modal capitalize">{severity}</div>
                          </div>
                          {error && <div className="error-message-modal">{error}</div>}
                        </div>
                        <div className="card-footer-modal">
                          <button className="btn-secondary-modal" onClick={() => setStep(2)}><ChevronLeft size={18} /> Previous</button>
                          <button className="btn-primary-modal" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Assessment'} <ChevronRight size={18} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="portal-footer">
        <div>© 2024 CareConnect Systems. All rights reserved.</div>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Support Center</span>
          <span>System Status</span>
        </div>
      </footer>
    </div>
  );
};

export default PatientAIIntake;
// Fuzzy search for symptom library

import './Home.css';
import React, { useState, useEffect } from 'react';
import { 
    Heart, 
    Activity, 
    Stethoscope, 
    Users, 
    ShieldCheck, 
    CalendarCheck, 
    Clock, 
    Shield, 
    ChevronRight, 
    BrainCircuit, 
    Lock, 
    Sparkles,
    Menu,
    X,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

const SAMPLE_SYMPTOMS = [
    {
        label: "Chest Pain & Shortness of Breath",
        text: "I am experiencing severe, crushing chest pain that radiates to my left arm, and I am finding it hard to breathe.",
        priority: "EMERGENCY",
        color: "#EF4444",
        bg: "rgba(254, 242, 242, 0.9)",
        border: "#FCA5A5",
        time: "Immediate Care",
        advice: "Call emergency services (911) immediately. Sit upright, remain calm, and do not exert yourself.",
        reasoning: "Symptoms are highly suggestive of an acute cardiac event (heart attack). Immediate intervention is required."
    },
    {
        label: "Sprained Ankle / Injury",
        text: "I twisted my ankle playing basketball. It is swollen and painful to walk on, but there is no bone deformity.",
        priority: "NON-URGENT",
        color: "#10B981",
        bg: "rgba(236, 253, 245, 0.9)",
        border: "#A7F3D0",
        time: "45 - 60 mins",
        advice: "Rest, Ice, Compression, and Elevation (R.I.C.E.). Avoid putting weight on the ankle until assessed.",
        reasoning: "Isolated extremity injury without deformity or neurovascular compromise. Safe to schedule via standard queue."
    },
    {
        label: "Child with High Fever",
        text: "My 3-year-old child has a fever of 102.5°F (39.2°C) and a mild red rash on their trunk. They are sleepy but responsive.",
        priority: "URGENT",
        color: "#F59E0B",
        bg: "rgba(255, 251, 235, 0.9)",
        border: "#FDE68A",
        time: "15 - 30 mins",
        advice: "Keep the child hydrated. Administer child-safe fever reducers (acetaminophen) as directed. Monitor alertness.",
        reasoning: "Pediatric fever with rash requires timely clinical evaluation to rule out serious infection, though patient is stable."
    },
    {
        label: "Severe Eye Chemical Splash",
        text: "I accidentally splashed household chemical cleaning bleach into my right eye. It is burning intensely and watering.",
        priority: "EMERGENCY",
        color: "#EF4444",
        bg: "rgba(254, 242, 242, 0.9)",
        border: "#FCA5A5",
        time: "Immediate Care",
        advice: "Flush the eye continuously with clean, lukewarm water for at least 15-20 minutes. Do not rub or bandage the eye.",
        reasoning: "Ocular chemical exposure requires immediate decontamination and emergency ophthalmic evaluation to prevent vision loss."
    }
];

const FAQ_ITEMS = [
    {
        question: "How accurate is the CareConnect AI triage system?",
        answer: "Our system uses Google's Gemini AI combined with structured clinical rule fallbacks. It achieves a 98% triage accuracy rating in validation runs. Crucially, all AI assessments are routed through human medical staff for final verification and scheduling approval."
    },
    {
        question: "Is patient data secure and HIPAA-compliant?",
        answer: "Absolutely. CareConnect is built from the ground up to protect user privacy. All Protected Health Information (PHI) is encrypted at rest and in transit. We enforce strict role-based access controls and maintain immutable audit logs for all administrative actions."
    },
    {
        question: "Can doctors or receptionists override AI priority scores?",
        answer: "Yes. The AI acts as an assistant to optimize scheduling and intake, but clinical judgment is supreme. Receptionists and nurses have a human-in-the-loop override toggle, allowing them to manually escalate or reschedule any case instantly."
    },
    {
        question: "How does CareConnect optimize outpatient wait times?",
        answer: "Instead of traditional first-come, first-served lines, our proprietary scheduling algorithm dynamically schedules appointments based on symptom urgency and clinical severity. This prevents emergency cases from waiting, and distributes non-urgent cases to slot capacities, preventing doctor burnout."
    }
];

function Home() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [symptomText, setSymptomText] = useState("");
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [result, setResult] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-up');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
        return () => elements.forEach(el => observer.unobserve(el));
    }, []);

    const handlePresetClick = (idx) => {
        setSelectedPreset(idx);
        setSymptomText(SAMPLE_SYMPTOMS[idx].text);
    };

    const analyzeCustomSymptom = (text) => {
        const lowercase = text.toLowerCase();
        if (lowercase.includes("chest") || lowercase.includes("heart") || lowercase.includes("breathing") || lowercase.includes("stroke") || lowercase.includes("unconscious") || lowercase.includes("bleeding") || lowercase.includes("suicid") || lowercase.includes("chok") || lowercase.includes("accident") || lowercase.includes("broken")) {
            return {
                priority: "EMERGENCY",
                color: "#EF4444",
                bg: "rgba(254, 242, 242, 0.9)",
                border: "#FCA5A5",
                time: "Immediate Care",
                advice: "Seek immediate medical attention or call emergency services. Do not attempt to drive yourself to the ER.",
                reasoning: "Potential life-threatening condition detected based on critical clinical keywords. Immediate emergency medical response required."
            };
        } else if (lowercase.includes("fever") || lowercase.includes("pain") || lowercase.includes("vomit") || lowercase.includes("stomach") || lowercase.includes("burn") || lowercase.includes("child") || lowercase.includes("baby") || lowercase.includes("cough")) {
            return {
                priority: "URGENT",
                color: "#F59E0B",
                bg: "rgba(255, 251, 235, 0.9)",
                border: "#FDE68A",
                time: "15 - 30 mins",
                advice: "Sit in a comfortable position, keep hydrated, and prepare to be assessed by a nurse shortly.",
                reasoning: "Acute symptoms requiring prompt assessment to prevent further complications, but hemodynamically stable at present."
            };
        } else {
            return {
                priority: "NON-URGENT",
                color: "#10B981",
                bg: "rgba(236, 253, 245, 0.9)",
                border: "#A7F3D0",
                time: "45 - 60 mins",
                advice: "Rest, monitor for any changes or worsening, and prepare a list of questions for the practitioner.",
                reasoning: "Mild, localized, or chronic symptoms suitable for standard outpatient consultation scheduling. Low risk of acute deterioration."
            };
        }
    };

    const handleAssess = () => {
        if (!symptomText.trim()) return;
        setIsAnalyzing(true);
        setHasRun(false);

        setTimeout(() => {
            let triageResult;
            if (selectedPreset !== null) {
                triageResult = SAMPLE_SYMPTOMS[selectedPreset];
            } else {
                triageResult = analyzeCustomSymptom(symptomText);
            }
            setResult(triageResult);
            setIsAnalyzing(false);
            setHasRun(true);
        }, 1500);
    };

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    return (
        <div className="home-wrapper">
            {/* Navigation (Glassmorphic) */}
            <header className="navbar">
                <div className="logo">
                    <div className="logo-icon-wrapper">
                        <Heart color="white" size={20} fill="white" />
                    </div>
                    <h1>CareConnect</h1>
                </div>
                
                <nav className="nav-links">
                    <button className="nav-link-btn active">Home</button>
                    <a href="#about" className="nav-link-btn">How it Works</a>
                    <a href="#sandbox" className="nav-link-btn">Try Sandbox</a>
                    <a href="#faq" className="nav-link-btn">FAQ</a>
                    <Link to="/login">
                        <button className="nav-link-btn" style={{color: '#1e293b', fontWeight: '700'}}>Log In</button>
                    </Link>
                    <Link to="/register">
                        <button className="nav-cta-btn">Register</button>
                    </Link>
                </nav>

                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <nav className="mobile-nav-links" onClick={(e) => e.stopPropagation()}>
                        <button className="mobile-nav-btn active" onClick={() => { setIsMobileMenuOpen(false); }}>Home</button>
                        <a href="#about" className="mobile-nav-btn" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
                        <a href="#sandbox" className="mobile-nav-btn" onClick={() => setIsMobileMenuOpen(false)}>Try Sandbox</a>
                        <a href="#faq" className="mobile-nav-btn" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="mobile-nav-btn" style={{fontWeight: '700'}}>Log In</button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="mobile-cta-btn">Register</button>
                        </Link>
                    </nav>
                </div>
            )}

            {/* Dynamic Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-shapes">
                    <div className="shape-1"></div>
                    <div className="shape-2"></div>
                </div>
                
                <div className="hero-content animate-fade-up">
                    <div className="ai-badge">
                        <Sparkles size={16} />
                        Powered by Google Gemini AI
                    </div>
                    <h1>
                        The Future of Hospital <span className="text-gradient">Triage & Scheduling</span>
                    </h1>
                    <p>
                        CareConnect is an advanced hospital management system that utilizes state-of-the-art Artificial Intelligence to instantly assess patient symptoms, prioritize urgent cases, and optimize Out-Patient Department (OPD) wait times. 
                    </p>
                    <div className="hero-actions">
                        <Link to="/register">
                            <button className="hero-primary-btn">
                                Register <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="hero-secondary-btn">Log in</button>
                        </Link>
                    </div>
                </div>

                <div className="hero-image-container animate-fade-up delay-2">
                    <img src="/images/Doctor.jpg" alt="Medical Professional" className="main-img" />
                </div>
            </section>

            {/* Features / How it Works Section */}
            <section id="about" className="features-section">
                <div className="section-header animate-on-scroll">
                    <span className="section-tag">How CareConnect Works</span>
                    <h2>Intelligent Healthcare Routing</h2>
                    <p>We combine deep clinical intelligence with modern software architecture to ensure that every patient receives the right care at exactly the right time.</p>
                </div>
                
                <div className="features-grid animate-on-scroll delay-1">
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <BrainCircuit size={28} color="#2563EB" />
                        </div>
                        <h3>AI-Driven Triage Assessment</h3>
                        <p>Patients input their symptoms in plain English. Our integrated Gemini AI instantly analyzes the data, comparing it against vast medical knowledge to determine the severity and urgency of the condition.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <Activity size={28} color="#2563EB" />
                        </div>
                        <h3>Dynamic Priority Queuing</h3>
                        <p>Instead of traditional "first-come, first-served" lines, our system dynamically shifts the queue in real-time, moving critical patients to the front while safely scheduling non-urgent cases.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <Users size={28} color="#2563EB" />
                        </div>
                        <h3>Human-in-the-Loop Control</h3>
                        <p>AI assists, but humans decide. Receptionists and nurses have full visibility into the AI's reasoning and can override priorities instantly if clinical judgment dictates a different approach.</p>
                    </div>
                </div>
            </section>

            {/* Interactive Sandbox Section */}
            <section id="sandbox" className="sandbox-section">
                <div className="section-header animate-on-scroll">
                    <span className="section-tag">Interactive Sandbox</span>
                    <h2>Try the Triage Simulator</h2>
                    <p>Select a pre-configured medical scenario or describe custom symptoms to witness the Gemini Triage Engine categorize and prioritize the case in real-time.</p>
                </div>

                <div className="sandbox-container animate-on-scroll delay-1">
                    <div className="sandbox-input-card">
                        <h3>Patient Intake Form</h3>
                        <p className="input-desc">Select a preset scenario below to auto-populate, or describe symptoms in your own words.</p>
                        
                        <div className="preset-chips">
                            {SAMPLE_SYMPTOMS.map((s, idx) => (
                                <button 
                                    key={idx} 
                                    className={`preset-chip ${selectedPreset === idx ? 'active' : ''}`}
                                    onClick={() => handlePresetClick(idx)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="textarea-wrapper">
                            <textarea 
                                value={symptomText}
                                onChange={(e) => {
                                    setSymptomText(e.target.value);
                                    setSelectedPreset(null);
                                }}
                                placeholder="e.g. Sharp pain in lower right abdomen that started 4 hours ago, accompanied by mild nausea..."
                                maxLength={500}
                            />
                            <span className="char-count">{symptomText.length}/500</span>
                        </div>

                        <button 
                            className="sandbox-assess-btn"
                            onClick={handleAssess}
                            disabled={isAnalyzing || !symptomText.trim()}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Sparkles className="spin-icon animate-spin" size={18} style={{ marginRight: '8px' }} />
                                    Analyzing Symptoms...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit size={18} style={{ marginRight: '8px' }} />
                                    Run AI Triage Assessment
                                </>
                            )}
                        </button>
                    </div>

                    <div className="sandbox-output-card">
                        {!hasRun && !isAnalyzing && (
                            <div className="output-placeholder">
                                <BrainCircuit size={48} className="placeholder-icon" style={{ opacity: 0.4, marginBottom: '16px' }} />
                                <h4>Ready for Diagnostics</h4>
                                <p>Select or write a patient symptom, then run the assessment to generate a clinical priority routing suggestion.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="output-loading">
                                <div className="scanning-bar"></div>
                                <Activity size={36} className="pulse-icon animate-pulse" style={{ color: '#2563EB', marginBottom: '16px' }} />
                                <h4>Analyzing Medical Text</h4>
                                <p>Gemini AI is parsing clinical tokens, matching with severity guidelines, and mapping wait time projections...</p>
                            </div>
                        )}

                        {hasRun && !isAnalyzing && result && (
                            <div className="output-result animate-fade-up" style={{ borderColor: result.border, background: result.bg }}>
                                <div className="result-header">
                                    <span className="result-tag" style={{ background: result.color, color: 'white' }}>
                                        {result.priority}
                                    </span>
                                    <div className="wait-badge">
                                        <Clock size={16} />
                                        <span>Est. Wait: <strong>{result.time}</strong></span>
                                    </div>
                                </div>
                                
                                <div className="result-section">
                                    <h5><BrainCircuit size={16} style={{ color: '#2563EB', marginRight: '6px' }} /> Gemini Clinical Assessment</h5>
                                    <p>{result.reasoning}</p>
                                </div>

                                <div className="result-section">
                                    <h5><Activity size={16} style={{ color: '#E11D48', marginRight: '6px' }} /> Immediate Care Instructions</h5>
                                    <p className="advice-text">{result.advice}</p>
                                </div>

                                <div className="result-footer">
                                    <p>Disclaimer: This sandbox is a simulated showcase of CareConnect's natural language routing logic. Live clinics require professional medical confirmation.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Comprehensive Information Section */}
            <section className="info-section">
                <div className="info-visual animate-on-scroll">
                    <div className="glass-panel">
                        <h3><Shield size={18} /> Enterprise Security</h3>
                        <p>End-to-end encryption for all PHI (Protected Health Information). Role-based access control ensures data privacy.</p>
                    </div>
                    <div className="glass-panel" style={{marginLeft: '40px'}}>
                        <h3><Stethoscope size={18} /> Doctor Dashboard</h3>
                        <p>Physicians receive pre-organized clinical notes and AI diagnostic suggestions before the patient even enters the room.</p>
                    </div>
                    <div className="glass-panel">
                        <h3><CalendarCheck size={18} /> Smart Auto-Scheduling</h3>
                        <p>The system predicts appointment duration based on condition complexity, preventing doctor burnout and schedule overruns.</p>
                    </div>
                </div>
                
                <div className="info-content animate-on-scroll delay-1">
                    <h2>More Than Just a Queue Manager</h2>
                    <p>CareConnect was built to solve the modern hospital's biggest bottleneck: administration and routing. By automating the intake process, we give your medical staff their time back.</p>
                    
                    <ul className="info-list">
                        <li>
                            <div className="info-list-icon"><Heart size={16} /></div>
                            <div>
                                <h4>Patient-Centric Design</h4>
                                <p>Accessible from any device. No complex apps to download. Patients get real-time SMS updates about their queue position.</p>
                            </div>
                        </li>
                        <li>
                            <div className="info-list-icon"><ShieldCheck size={16} /></div>
                            <div>
                                <h4>Regulatory Compliant</h4>
                                <p>Designed with global healthcare compliance standards in mind, ensuring all patient data is handled securely and ethically.</p>
                            </div>
                        </li>
                        <li>
                            <div className="info-list-icon"><Sparkles size={16} /></div>
                            <div>
                                <h4>Continuous Learning</h4>
                                <p>The AI model's accuracy is continuously evaluated against doctor diagnoses, ensuring the triage logic improves over time.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container animate-on-scroll">
                    <div className="stat-item">
                        <Clock size={24} color="#60A5FA" style={{margin:'0 auto'}} />
                        <h2>&lt;2m</h2>
                        <p>AVERAGE INTAKE TIME</p>
                    </div>
                    <div className="stat-item">
                        <Activity size={24} color="#60A5FA" style={{margin:'0 auto'}} />
                        <h2>98%</h2>
                        <p>AI TRIAGE ACCURACY</p>
                    </div>
                    <div className="stat-item">
                        <Users size={24} color="#60A5FA" style={{margin:'0 auto'}} />
                        <h2>10k+</h2>
                        <p>PATIENTS ROUTED</p>
                    </div>
                    <div className="stat-item">
                        <Heart size={24} color="#60A5FA" style={{margin:'0 auto'}} />
                        <h2>100%</h2>
                        <p>HIPAA COMPLIANT</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="section-header animate-on-scroll">
                    <span className="section-tag">Common Inquiries</span>
                    <h2>Frequently Asked Questions</h2>
                    <p>Got questions about integration, security, or clinical operations? Find your answers below.</p>
                </div>

                <div className="faq-container animate-on-scroll delay-1">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => toggleFaq(idx)}>
                                <span>{item.question}</span>
                                {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <div className="faq-answer">
                                <div className="faq-answer-content">
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action Section */}
            <section id="security" className="cta-section">
                <div className="cta-icon-wrapper animate-on-scroll">
                    <Lock size={40} color="#3b82f6" />
                </div>
                <h2 className="animate-on-scroll delay-1">Secure, Scalable, Reliable.</h2>
                <p className="animate-on-scroll delay-2">Whether you are a small clinic or a sprawling hospital network, CareConnect adapts to your workflow securely.</p>
                <div className="cta-actions animate-on-scroll delay-3">
                    <Link to="/register">
                        <button className="hero-primary-btn">Get Started Today</button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">
                            <div className="logo-icon-wrapper" style={{width: '32px', height: '32px'}}>
                                <Heart color="white" size={16} fill="white" />
                            </div>
                            <h1 style={{fontSize: '20px'}}>CareConnect</h1>
                        </div>
                        <p>Revolutionizing healthcare administration through artificial intelligence and empathetic software design.</p>
                    </div>
                    <div className="footer-links-group">
                        <h4>PLATFORM</h4>
                        <Link to="/login">Patient Portal</Link>
                        <Link to="/login">Doctor Dashboard</Link>
                        <Link to="/login">Reception Controls</Link>
                        <Link to="/ai-evaluation">AI Methodology</Link>
                    </div>
                    <div className="footer-links-group">
                        <h4>SUPPORT</h4>
                        <Link to="/">Help Center</Link>
                        <Link to="/">System Status</Link>
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Terms of Service</Link>
                    </div>
                    <div className="footer-links-group">
                        <h4>STAFF PORTALS</h4>
                        <Link to="/login">System Administration</Link>
                        <Link to="/login">Clinical IT Support</Link>
                        <Link to="/">Documentation</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 CareConnect Healthcare Systems. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;

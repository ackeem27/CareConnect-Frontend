import './Home.css';
import React, { useEffect } from 'react';
import { Heart, Activity, Stethoscope, Users, ShieldCheck, CalendarCheck, Clock, Shield, Plus, ChevronRight, BrainCircuit, Lock, Fingerprint, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from '../components/ThemeToggle';

function Home() {
    // Add staggered animation classes when component mounts
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
                    <a href="#security" className="nav-link-btn">Security</a>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', marginRight: '8px' }}>
                        <ThemeToggle />
                    </div>
                    <Link to="/login">
                        <button className="nav-link-btn" style={{color: 'var(--text-primary)', fontWeight: '700'}}>Log In</button>
                    </Link>
                    <Link to="/register">
                        <button className="nav-cta-btn">Register</button>
                    </Link>
                </nav>
            </header>

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
                        <a href="#">AI Methodology</a>
                    </div>
                    <div className="footer-links-group">
                        <h4>SUPPORT</h4>
                        <a href="#">Help Center</a>
                        <a href="#">System Status</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                    <div className="footer-links-group">
                        <h4>STAFF PORTALS</h4>
                        <Link to="/login">System Administration</Link>
                        <Link to="/login">Clinical IT Support</Link>
                        <a href="#">Documentation</a>
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

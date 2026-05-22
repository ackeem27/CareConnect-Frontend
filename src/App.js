import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Base Pages
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentConfirmation from './pages/AppointmentConfirmation';

// Auth Pages
import UnifiedLogin from './pages/auth/UnifiedLogin';
import UnifiedRegister from './pages/auth/UnifiedRegister';
import ForgotPassword from './pages/auth/ForgotPassword';

// AI Components
import PatientAIIntake from './components/ai/PatientAIIntake';
import AIPriorityQueue from './components/ai/AIPriorityQueue';
import AIAccuracyDashboard from './components/ai/AIAccuracyDashboard';

// Layout
import MainDashboardLayout from './components/layout/MainDashboardLayout';

import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Home />} />
          
          {/* Registration & Login */}
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/register" element={<UnifiedRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Patient Module */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/intake" element={<PatientAIIntake />} />
          <Route path="/appointment-confirmed" element={<AppointmentConfirmation />} />
          
          {/* Staff Modules (Wrapped in Dashboard Layout) */}
          <Route path="/doctor" element={<MainDashboardLayout role="doctor"><DoctorDashboard /></MainDashboardLayout>} />
          <Route path="/receptionist" element={<MainDashboardLayout role="receptionist"><ReceptionistDashboard /></MainDashboardLayout>} />
          <Route path="/queue" element={<MainDashboardLayout role="doctor"><AIPriorityQueue /></MainDashboardLayout>} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* AI Evaluation */}
          <Route path="/ai-evaluation" element={<MainDashboardLayout role="admin"><AIAccuracyDashboard /></MainDashboardLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;// Protected route guard

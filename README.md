# CareConnect Frontend

This is the React-based frontend for the CareConnect Hospital Management System.

## 🛠 Prerequisites
- Node.js 18+
- npm or yarn

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env` file in this directory and add the following:
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

### 2. Installation
```bash
npm install
```

## 🚀 Running the App
```bash
npm start
```
The application will launch at `http://localhost:3000`.

## ✨ Key Features
- **Unified Auth Portal:** Role-based login and registration for Patients and Staff.
- **AI Symptom Intake:** Multi-step triage form with real-time feedback.
- **Smart Queue:** Live-updating priority queue with AI-generated reasoning.
- **Role Dashboards:** Specialized interfaces for Doctors, Receptionists, and Admins.
- **AI Accuracy Dashboard:** Live tool to evaluate AI triage performance against clinical test cases.

## 🎨 Design System
The UI uses a custom-built design system focused on clinical clarity and premium aesthetics, featuring:
- Responsive Grid Layouts
- Glassmorphism UI elements
- Dynamic Status Badges (AI-driven)
- Accessible Typography

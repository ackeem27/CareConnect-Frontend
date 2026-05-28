# CareConnect Frontend

This is the React-based frontend for the CareConnect Hospital Management System.

##  Prerequisites
- Node.js 18+
- npm or yarn

##  Configuration

### 1. Environment Variables
Create a `.env` file in this directory and add the following:
```env
REACT_APP_API_URL=http://localhost:3001
```

Do not include `/api/v1`; the API client appends that path automatically.

### 2. Installation
```bash
npm install
```

##  Running the App
```bash
npm start
```
The application will launch at `http://localhost:3000`.

##  Northflank Deployment

Deploy this repository as a Dockerfile service:

- Dockerfile path: `Dockerfile`
- Build context: repository root

Set the backend host only:

```env
REACT_APP_API_URL=https://<your-backend-public-url>
```

Do not include `/api/v1`; the API client appends that path automatically.

##  Key Features
- **Unified Auth Portal:** Role-based login and registration for Patients and Staff.
- **AI Symptom Intake:** Multi-step triage form with real-time feedback.
- **Smart Queue:** Live-updating priority queue with AI-generated reasoning.
- **Role Dashboards:** Specialized interfaces for Doctors, Receptionists, and Admins.
- **AI Accuracy Dashboard:** Live tool to evaluate AI triage performance against clinical test cases.

##  Design System
The UI uses a custom-built design system focused on clinical clarity and premium aesthetics, featuring:
- Responsive Grid Layouts
- Glassmorphism UI elements
- Dynamic Status Badges (AI-driven)
- Accessible Typography

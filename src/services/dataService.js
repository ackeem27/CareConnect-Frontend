import apiClient from './apiClient';

const STORAGE_KEYS = {
  TOKEN: 'careconnect_token',
  CURRENT_USER: 'careconnect_active_user'
};

export const authService = {
  async login(email, password) {
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      
      // Store token and user info
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      
      const user = {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        email_verified: data.email_verified
      };
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  async registerPatient(patientData) {
    const payload = {
      email: patientData.email,
      password: patientData.password,
      password_confirmation: patientData.password_confirmation,
      role: 'patient',
      name: `${patientData.first_name} ${patientData.last_name}`,
      phone: patientData.phone,
      date_of_birth: patientData.date_of_birth
    };

    try {
      const data = await apiClient.post('/users', payload);
      // Store token immediately
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  async registerStaff(staffData) {
    const payload = {
      email: staffData.email,
      password: staffData.password,
      password_confirmation: staffData.password_confirmation,
      role: staffData.role,
      name: staffData.name,
      phone: staffData.phone
    };

    try {
      const data = await apiClient.post('/users', payload);
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  async verifyOtp(email, otpCode) {
    try {
      return await apiClient.post('/users/verify_otp', { email, otp_code: otpCode });
    } catch (error) {
      throw error;
    }
  },

  async resendOtp(email) {
    try {
      return await apiClient.post('/users/resend_otp', { email });
    } catch (error) {
      throw error;
    }
  }
};

export const appointmentService = {
  async fetchQueue() {
    try {
      return await apiClient.get('/appointments/queue');
    } catch (error) {
      console.error('Failed to fetch queue from backend:', error);
      return []; // Return empty queue on error
    }
  },

  async fetchMyAppointments() {
    try {
      return await apiClient.get('/appointments/my');
    } catch (error) {
      console.error('Failed to fetch my appointments:', error);
      return [];
    }
  },
  
  async createAppointment(symptoms, severity = 'low', preferredDate = null) {
    try {
      return await apiClient.post('/appointments', { symptoms, severity, preferred_date: preferredDate });
    } catch (error) {
      throw error;
    }
  },
  
  async deleteAppointment(id) {
    try {
      await apiClient.delete(`/appointments/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async cancel(id) {
    try {
      await apiClient.delete(`/appointments/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      return await apiClient.patch(`/appointments/${id}`, { appointment: { status } });
    } catch (error) {
      throw error;
    }
  },

  async updateDiagnosis(id, diagnosis, notes) {
    try {
      return await apiClient.patch(`/appointments/${id}`, { appointment: { diagnosis, notes } });
    } catch (error) {
      throw error;
    }
  },
  
  async clearAll() {
    try {
      await apiClient.delete('/appointments/clear_all');
      return true;
    } catch (error) {
      throw error;
    }
  },

  async walkinRegistration({ name, phone, symptoms, severity, age }) {
    try {
      return await apiClient.post('/appointments/walkin', { name, phone, symptoms, severity, age });
    } catch (error) {
      throw error;
    }
  },

  async autoSchedule() {
    try {
      return await apiClient.post('/appointments/auto_schedule');
    } catch (error) {
      throw error;
    }
  },

  async finalizeEncounter(id, { diagnosis, notes, treatment_plan, prescriptions }) {
    try {
      return await apiClient.post(`/appointments/${id}/finalize`, {
        diagnosis, notes, treatment_plan, prescriptions
      });
    } catch (error) {
      throw error;
    }
  }
};

export const scheduleService = {
  async fetchSchedule() {
    try {
      return await apiClient.get('/schedule');
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      return [];
    }
  },

  async approve(id) {
    try {
      return await apiClient.post(`/schedule/approve/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async reject(id, reason = '') {
    try {
      return await apiClient.post(`/schedule/reject/${id}`, { reason });
    } catch (error) {
      throw error;
    }
  },

  async override(id, priorityLevel, priorityScore) {
    try {
      return await apiClient.patch(`/schedule/override/${id}`, {
        priority_level: priorityLevel,
        priority_score: priorityScore
      });
    } catch (error) {
      throw error;
    }
  },

  async reschedule(id, scheduledAt) {
    try {
      return await apiClient.patch(`/schedule/reschedule/${id}`, {
        scheduled_at: scheduledAt
      });
    } catch (error) {
      throw error;
    }
  },

  async swap(id, direction) {
    try {
      return await apiClient.patch(`/schedule/swap/${id}`, { direction });
    } catch (error) {
      throw error;
    }
  },

  async fetchDoctors() {
    try {
      return await apiClient.get('/users?role=doctor');
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      return [];
    }
  }
};

export const notificationService = {
  async fetchNotifications() {
    try {
      return await apiClient.get('/notifications');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], unread_count: 0 };
    }
  },

  async markAsRead(id) {
    try {
      return await apiClient.patch(`/notifications/${id}/mark_read`);
    } catch (error) {
      throw error;
    }
  },

  async markAllRead() {
    try {
      return await apiClient.post('/notifications/mark_all_read');
    } catch (error) {
      throw error;
    }
  },

  async clear() {
    try {
      await apiClient.delete('/notifications/clear');
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export const adminService = {
  async fetchStats() {
    try {
      return await apiClient.get('/admin/stats');
    } catch (error) {
      throw error;
    }
  },

  async fetchUsers() {
    try {
      return await apiClient.get('/admin/users');
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, data) {
    try {
      return await apiClient.patch(`/admin/users/${id}`, data);
    } catch (error) {
      throw error;
    }
  },

  async deactivateUser(id) {
    try {
      return await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async fetchActivityLogs() {
    try {
      return await apiClient.get('/admin/activity_logs');
    } catch (error) {
      throw error;
    }
  },

  async fetchConfigs() {
    try {
      return await apiClient.get('/admin/configs');
    } catch (error) {
      throw error;
    }
  },

  async updateConfig(id, value) {
    try {
      return await apiClient.patch(`/admin/configs/${id}`, { value });
    } catch (error) {
      throw error;
    }
  }
};

export const healthService = {
  async checkHealth() {
    try {
      return await apiClient.get('/health');
    } catch (error) {
      throw error;
    }
  }
};

export const aiEvaluationService = {
  async runTestCases() {
    try {
      return await apiClient.get('/ai_evaluation/test_cases');
    } catch (error) {
      throw error;
    }
  },

  async runSingleTest(symptoms, severity, age, chronicConditions = []) {
    try {
      return await apiClient.post('/ai_evaluation/single', {
        symptoms, severity, age, chronic_conditions: chronicConditions
      });
    } catch (error) {
      throw error;
    }
  }
};

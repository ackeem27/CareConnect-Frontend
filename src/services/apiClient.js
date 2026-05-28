export const API_HOST = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const BASE_URL = `${API_HOST}/api/v1`;

const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('careconnect_token');
    
    const headers = {
      ...options.headers,
    };

    if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
      // Allow browser to set content-type with boundary automatically
    } else {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (response.status === 204) {
        return true;
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      let isJson = contentType && contentType.includes('application/json');

      if (isJson) {
        try {
          data = await response.json();
        } catch (e) {
          isJson = false;
        }
      }

      if (!response.ok) {
        let errorMessage = 'Something went wrong';
        if (isJson && data) {
          errorMessage = data.errors ? data.errors.join(', ') : data.error || errorMessage;
        } else {
          try {
            const text = await response.text();
            errorMessage = text || response.statusText || errorMessage;
          } catch (_) {
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      if (!isJson) {
        try {
          const text = await response.text();
          return text;
        } catch (_) {
          return null;
        }
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('fb_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    getProfile: async () => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateProfile: async (profileData) => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return handleResponse(res);
    }
  },

  // Donations
  donations: {
    create: async (donationData) => {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(donationData)
      });
      return handleResponse(res);
    },
    list: async (filters = {}) => {
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      if (filters.donorId) query.append('donorId', filters.donorId);
      
      const res = await fetch(`${API_BASE}/donations?${query.toString()}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getDetails: async (id) => {
      const res = await fetch(`${API_BASE}/donations/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    rate: async (id, ratingData) => {
      const res = await fetch(`${API_BASE}/donations/${id}/rate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ratingData)
      });
      return handleResponse(res);
    },
    createEmergency: async (requestData) => {
      const res = await fetch(`${API_BASE}/donations/emergency`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestData)
      });
      return handleResponse(res);
    },
    listEmergency: async (status) => {
      const query = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/donations/emergency${query}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    fulfillEmergency: async (id) => {
      const res = await fetch(`${API_BASE}/donations/emergency/${id}/fulfill`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Deliveries
  deliveries: {
    claimDonation: async (id) => {
      const res = await fetch(`${API_BASE}/deliveries/${id}/claim-donation`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    claimDelivery: async (id) => {
      const res = await fetch(`${API_BASE}/deliveries/${id}/claim-delivery`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_BASE}/deliveries/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    verifyQr: async (id, qrCode) => {
      const res = await fetch(`${API_BASE}/deliveries/${id}/verify-qr`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ qrCode })
      });
      return handleResponse(res);
    }
  },

  // Admin
  admin: {
    getAnalytics: async () => {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    listUsers: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    toggleNgoVerification: async (userId) => {
      const res = await fetch(`${API_BASE}/admin/verify-ngo`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
      });
      return handleResponse(res);
    },
    deleteUser: async (id) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    deleteDonation: async (id) => {
      const res = await fetch(`${API_BASE}/admin/donations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Chat
  chat: {
    sendMessage: async (chatData) => {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(chatData)
      });
      return handleResponse(res);
    },
    getMessages: async (donationId) => {
      const res = await fetch(`${API_BASE}/chat/${donationId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Notifications
  notifications: {
    list: async () => {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    markAsRead: async (id) => {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Inquiries
  inquiries: {
    submit: async (inquiryData) => {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(inquiryData)
      });
      return handleResponse(res);
    },
    list: async () => {
      const res = await fetch(`${API_BASE}/inquiries`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // AI Assistant Insights
  ai: {
    estimateShelfLife: async (title, category, description) => {
      const res = await fetch(`${API_BASE}/ai/estimate-shelf-life`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, category, description })
      });
      return handleResponse(res);
    },
    categorize: async (title, description) => {
      const res = await fetch(`${API_BASE}/ai/categorize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, description })
      });
      return handleResponse(res);
    }
  }
};

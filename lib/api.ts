import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// 응답 인터셉터: 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  register: async (name: string, username: string, password: string) => {
    const response = await api.post('/auth/register', { name, username, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Members API
export const membersAPI = {
  add: async (name: string, phone?: string) => {
    const response = await api.post('/members/add', { name, phone });
    return response.data;
  },
  search: async (name?: string, phone?: string) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (phone) params.append('phone', phone);
    const response = await api.get(`/members/All?${params.toString()}`);
    return response.data;
  },
};

// Visit Records API
export const visitRecordsAPI = {
  create: async (memberId: number, data: {
    treatment: string;
    price?: number;
    memo?: string;
    visited_at?: string;
  }) => {
    const response = await api.post(`/visit-records/members/${memberId}/visit-records`, {
      member_id: memberId,
      treatment: data.treatment,
      price: data.price,
      memo: data.memo,
      visited_at: data.visited_at,
    });
    return response.data;
  },
  getByMemberId: async (memberId: number) => {
    const response = await api.get(`/visit-records/members/${memberId}`);
    return response.data;
  },
  getByDate: async (date: string) => {
    const response = await api.get(`/visit-records/Date?date=${date}`);
    return response.data;
  },
};

export default api;

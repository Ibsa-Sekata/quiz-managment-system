import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    register: async (fullName, email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/register', { fullName, email, password });
            set({ loading: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            set({ isAuthenticated: false, user: null });
        }
    },

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}));

import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            
            const { user } = useAuthStore.getState();

            if (user) {
                toast.error("Sua sessão expirou. Por favor, faça login novamente.");
                useAuthStore.getState().logout();

                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
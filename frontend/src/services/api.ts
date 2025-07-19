import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
    // Se a resposta for um sucesso (código 2xx), apenas a repasse
    (response) => {
        return response;
    },
    // Se a resposta for um erro...
    (error) => {
        // Verificamos se o erro é o que esperamos: um erro de resposta com status 401
        if (error.response && error.response.status === 401) {
            
            // Pega o estado atual da store para verificar se o usuário realmente estava logado no frontend
            const { user } = useAuthStore.getState();

            // Só executa a lógica de logout se havia um usuário logado no frontend.
            // Isso evita loops de redirecionamento ou toasts desnecessários se a página inicial já fizer uma chamada não autorizada.
            if (user) {
                console.log("Interceptor: Token expirado ou inválido. Deslogando...");

                // Mostra uma mensagem amigável para o usuário
                toast.error("Sua sessão expirou. Por favor, faça login novamente.");

                // Pega a função de logout diretamente da store do Zustand
                // e a executa para limpar o localStorage e o estado.
                useAuthStore.getState().logout();

                // Força o redirecionamento da página para o login.
                // Usar window.location.href é bom aqui pois força um recarregamento completo, limpando qualquer estado de componente.
                window.location.href = '/login';
            }
        }

        // Para qualquer outro tipo de erro (500, 404, etc.), nós simplesmente
        // rejeitamos a promise para que o bloco .catch() local da chamada possa tratá-lo.
        return Promise.reject(error);
    }
);

// Adiciona o token a todas as requisições, se ele existir
api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
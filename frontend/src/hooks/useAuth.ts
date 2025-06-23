'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Hook para proteger rotas. Verifica se o utilizador está autenticado no lado do cliente.
 * @returns {boolean} isReady - True quando a verificação estiver concluída e o utilizador estiver autenticado.
 */
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    // Este estado garante que a verificação só acontece após a renderização no cliente.
    const [isReady, setIsReady] = useState(false); 

    useEffect(() => {
        // Se, após a renderização no cliente, não houver utilizador, redireciona para o login.
        if (!user) {
            router.replace('/login');
        } else {
            // Se houver um utilizador, a rota está pronta para ser exibida.
            setIsReady(true);
        }
    }, [user, router]);

    return { isReady, user };
}
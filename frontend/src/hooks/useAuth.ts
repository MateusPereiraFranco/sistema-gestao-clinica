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
    const [isReady, setIsReady] = useState(false); 

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        } else {
            setIsReady(true);
        }
    }, [user, router]);

    return { isReady, user };
}
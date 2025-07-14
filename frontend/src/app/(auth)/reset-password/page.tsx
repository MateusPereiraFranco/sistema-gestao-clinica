'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput';

function ResetPasswordComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailFromQuery = searchParams.get('email');
        if (emailFromQuery) {
            setEmail(decodeURIComponent(emailFromQuery));
        } else {
            // Se não houver email, não faz sentido estar nesta página.
            toast.error("Email não fornecido. Por favor, comece o processo novamente.");
            router.push('/forgot-password');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validação das palavras-passe
        if (newPassword !== confirmPassword) {
            toast.error("As palavras-passe não coincidem.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("A nova palavra-passe deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("A redefinir palavra-passe...");
        try {
            await api.post('/auth/reset-password', { email, token, newPassword });
            toast.success("Palavra-passe redefinida com sucesso!", { id: toastId });
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao redefinir. O código pode estar incorreto ou ter expirado.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center">Redefinir Palavra-passe</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email_reset" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email_reset" type="email" value={email} readOnly disabled 
                            className="mt-1 w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed"/>
                    </div>
                     <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">Código de Verificação</label>
                        <input id="token" type="text" value={token} onChange={e => setToken(e.target.value)} required placeholder="Código de 6 dígitos"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Palavra-passe</label>
                        <PasswordInput id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••"/>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Palavra-passe</label>
                        <PasswordInput id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
                        {isLoading ? "A guardar..." : "Redefinir Palavra-passe"}
                    </button>
                </form>
                 <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Voltar para o Login</Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>A carregar...</div>}>
            <ResetPasswordComponent />
        </Suspense>
    )
}
'use client';

import { useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading("A enviar código...");
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success("Se o email existir, um código foi enviado.", { id: toastId });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (error) {
            toast.error("Ocorreu um erro. Tente novamente.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Recuperar Palavra-passe</h2>
                    <p className="mt-2 text-sm text-gray-600">Insira o seu email para receber um código de verificação de 6 dígitos.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                         <label htmlFor="email" className="sr-only">Email</label>
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Seu email"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
                        {isLoading ? "A enviar..." : "Enviar Código"}
                    </button>
                </form>
                <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Voltar para o Login</Link>
                </div>
            </div>
        </div>
    );
}
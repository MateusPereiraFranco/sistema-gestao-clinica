'use client';

import { useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import PasswordInput from '../ui/PasswordInput'; // Reutilizando o nosso componente

export default function ChangePasswordForm() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("As novas palavras-passe não coincidem.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("A nova palavra-passe deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("A atualizar palavra-passe...");
        try {
            await api.patch('/auth/update-password', {
                currentPassword,
                newPassword,
            });
            toast.success("Palavra-passe atualizada com sucesso!", { id: toastId });
            // Limpa os campos após o sucesso
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao atualizar a palavra-passe.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-gray-900">
                        Palavra-passe Atual
                    </label>
                    <div className="mt-2">
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="Digite a sua palavra-passe atual"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">
                        Nova Palavra-passe
                    </label>
                    <div className="mt-2">
                         <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Pelo menos 6 caracteres"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                        Confirmar Nova Palavra-passe
                    </label>
                    <div className="mt-2">
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Repita a nova palavra-passe"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
                    >
                        {isLoading ? "A guardar..." : "Guardar Nova Palavra-passe"}
                    </button>
                </div>
            </form>
        </div>
    );
}
'use client';

import Header from "@/components/layout/Header";
import UserForm from "@/components/users/UserForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NovoUsuarioPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    // Proteção do lado do cliente para a rota
    useEffect(() => {
        if (user && user.profile === 'normal') {
            router.replace('/dashboard');
        }
    }, [user, router]);

    if (user?.profile === 'normal') {
        return null; // ou um ecrã de "Acesso Negado"
    }

    return (
        <>
            <Header title="Criar Novo Utilizador" />
            <main className="flex-1 overflow-y-auto p-6">
                 <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                    <UserForm />
                 </div>
            </main>
        </>
    );
}
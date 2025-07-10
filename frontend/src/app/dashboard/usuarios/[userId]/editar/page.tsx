'use client';

import Header from "@/components/layout/Header";
import UserForm from "@/components/users/UserForm";
import api from "@/services/api";
import { User } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarUsuarioPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            api.get(`/users/${userId}/for-edit`)
                .then(res => setUserToEdit(res.data))
                .catch(() => setError("Utilizador não encontrado ou acesso negado."))
                .finally(() => setIsLoading(false));
        }
    }, [userId]);

    if (isLoading) return <div className="p-6">A carregar dados...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <>
            <Header title={`Editar Utilizador: ${userToEdit?.name}`} />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                    {userToEdit && <UserForm userToEdit={userToEdit} />}
                </div>
            </main>
        </>
    );
}
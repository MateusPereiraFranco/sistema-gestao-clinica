'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import { User, Specialty } from "@/types";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import UserFilters from "@/components/users/UserFilters";
import UserTable from "@/components/users/UserTable";

export default function GerirUsuariosPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async (filters: any = {}) => {
        if (!user) {
            return;
        }
        setIsLoading(true);
        if (filters.is_active === undefined) {
            filters.is_active = true;
        }
        try {
            const response = await api.get('/users', { params: filters });
            setUsers(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar os utilizadores.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.profile === 'normal') {
            router.replace('/dashboard');
            return;
        }
        
        fetchUsers();

        if (user) {
            api.get('/specialties').then(res => setSpecialties(res.data));
        }
    }, [user, router, fetchUsers]);

    const handleSearch = (filters: { name: string; specialtyId: string, is_active: boolean }) => {
        fetchUsers(filters);
    };

    const handleSpecialtyCreated = (newSpecialty: Specialty) => {
        setSpecialties(prevSpecialties => [...prevSpecialties, newSpecialty]);
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Tem a certeza que deseja apagar este utilizador?")) {
            try {
                await api.delete(`/users/${userId}`);
                toast.success("Utilizador apagado com sucesso.");
                fetchUsers();
            } catch (error) {
                toast.error("Falha ao apagar o utilizador.");
            }
        }
    };

    const handleToggleStatus = async (userId: string) => {
        const userToToggle = users.find(u => u.user_id === userId);
        const actionText = userToToggle?.is_active ? 'inativar' : 'reativar';
        
        if (window.confirm(`Tem a certeza que deseja ${actionText} este utilizador?`)) {
            try {
                await api.patch(`/users/${userId}/toggle-active`);
                toast.success(`Utilizador ${actionText} com sucesso.`);
                fetchUsers();
            } catch (error) {
                toast.error(`Falha ao ${actionText} o utilizador.`);
            }
        }
    };

    const headerAction = (
        <Link href="/dashboard/usuarios/novo"
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-2 sm:px-4 rounded-lg shadow-sm hover:bg-indigo-700">
            <PlusCircle size={20} />
            <span className="hidden sm:inline">Adicionar Utilizador</span>
        </Link>
    );

    return (
        <>
            <Header title="Gestão de Utilizadores" action={headerAction} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <UserFilters 
                    specialties={specialties}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onSpecialtyCreated={handleSpecialtyCreated}
                />
                <UserTable users={users} isLoading={isLoading} onDelete={handleDeleteUser} onToggleStatus={handleToggleStatus} />
            </main>
        </>
    );
}

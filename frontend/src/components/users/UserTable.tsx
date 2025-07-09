'use client';

import { User } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    onDelete: (userId: string) => void;
}

export default function UserTable({ users, isLoading, onDelete }: UserTableProps) {
    const { user: loggedInUser } = useAuthStore();

    if (isLoading) return <p className="text-center p-8">A carregar utilizadores...</p>;
    if (users.length === 0) return <p className="text-center p-8 bg-gray-50 rounded-md">Nenhum utilizador encontrado.</p>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                        {loggedInUser?.profile === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>}
                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.user_id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.specialty_name || 'N/A'}</td>
                            {loggedInUser?.profile === 'admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.unit_name || 'N/A'}</td>}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button className="text-blue-600 hover:text-blue-900" title="Editar Utilizador"><Pencil className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(user.user_id)} className="text-red-600 hover:text-red-900" title="Apagar Utilizador"><Trash2 className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
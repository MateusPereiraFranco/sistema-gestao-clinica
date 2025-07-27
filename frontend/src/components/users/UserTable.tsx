'use client';

import { User } from "@/types";
import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import Link from 'next/link';

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    onDelete: (userId: string) => void;
    onToggleStatus: (userId: string) => void;
}

// 1. A prop 'onDelete' foi adicionada à desestruturação
export default function UserTable({ users, isLoading, onDelete, onToggleStatus }: UserTableProps) {
    const { user: loggedInUser } = useAuthStore();

    if (isLoading) return <p className="text-center p-8">A carregar utilizadores...</p>;
    if (users.length === 0) return <p className="text-center p-8 bg-gray-50 rounded-md">Nenhum utilizador encontrado.</p>;
    
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabela para ecrãs médios e maiores (md:) */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                        {loggedInUser?.profile === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.specialty_name || 'N/A'}</td>
                            {loggedInUser?.profile === 'admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.unit_name || 'N/A'}</td>}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Link href={`/dashboard/usuarios/${user.user_id}/editar`} className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900" title="Editar Utilizador">
                                    <Pencil className="w-5 h-5"/>
                                </Link>
                                <button onClick={() => onToggleStatus(user.user_id)} 
                                    className={`p-2 ${user.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                    title={user.is_active ? 'Inativar Utilizador' : 'Reativar Utilizador'}>
                                    {user.is_active ? <UserX className="w-5 h-5"/> : <UserCheck className="w-5 h-5"/>}
                                </button>
                                {/* 2. Botão de apagar adicionado para master e admin */}
                                {(loggedInUser?.profile === 'master' || loggedInUser?.profile === 'admin') && (
                                    <button onClick={() => onDelete(user.user_id)} className="inline-flex items-center p-2 text-red-600 hover:text-red-900" title="Apagar Utilizador">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Visualização em "cartões" para telemóveis (md:hidden) */}
            <div className="md:hidden">
                {users.map((user) => (
                    <div key={user.user_id} className="border-b p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-indigo-700">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ml-4 ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                            <p><span className="font-medium">Especialidade:</span> {user.specialty_name || 'N/A'}</p>
                            {loggedInUser?.profile === 'admin' && <p><span className="font-medium">Unidade:</span> {user.unit_name || 'N/A'}</p>}
                        </div>
                        <div className="flex justify-end items-center space-x-2 mt-3 pt-3 border-t">
                             <Link href={`/dashboard/usuarios/${user.user_id}/editar`} className="inline-flex items-center p-2 text-blue-600" title="Editar Utilizador">
                                <Pencil className="w-5 h-5"/>
                            </Link>
                            <button onClick={() => onToggleStatus(user.user_id)} 
                                className={`p-2 ${user.is_active ? 'text-yellow-600' : 'text-green-600'}`}
                                title={user.is_active ? 'Inativar Utilizador' : 'Reativar Utilizador'}>
                                {user.is_active ? <UserX className="w-5 h-5"/> : <UserCheck className="w-5 h-5"/>}
                            </button>
                            {(loggedInUser?.profile === 'master' || loggedInUser?.profile === 'admin') && (
                                <button onClick={() => onDelete(user.user_id)} className="inline-flex items-center p-2 text-red-600" title="Apagar Utilizador">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
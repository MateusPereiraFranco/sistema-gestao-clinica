'use client';

import { Unit, Specialty, User } from '@/types';
import api from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface UserFormProps {
    userToEdit?: User; // O utilizador a ser editado (opcional)
}

export default function UserForm({ userToEdit }: UserFormProps) {
    const router = useRouter();
    const { user: loggedInUser } = useAuthStore();
    const [units, setUnits] = useState<Unit[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const isEditing = !!userToEdit;

    const [formData, setFormData] = useState({
        name: userToEdit?.name || '',
        email: userToEdit?.email || '',
        password: '', // A palavra-passe fica em branco no modo de edição
        profile: userToEdit?.profile || 'normal',
        unit_id: userToEdit?.unit_id || loggedInUser?.unit_id || '',
        specialty_id: userToEdit?.specialty_id || '',
        is_active: userToEdit?.is_active ?? true,
    });

    useEffect(() => {
        // Busca as listas de unidades e especialidades
        if (loggedInUser?.profile === 'admin') {
            api.get('/units').then(res => setUnits(res.data));
        }
        api.get('/specialties').then(res => {
            setSpecialties(res.data);
            if (!isEditing && res.data.length > 0) {
                setFormData(prev => ({ ...prev, specialty_id: res.data[0].specialty_id }));
            }
        });
    }, [loggedInUser, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing) {
                // Remove a palavra-passe do objeto se não for preenchida
                const { password, ...updateData } = formData;
                const dataToSend = password ? formData : updateData;
                await api.put(`/users/${userToEdit.user_id}`, dataToSend);
                toast.success("Utilizador atualizado com sucesso!");
            } else {
                await api.post('/users', formData);
                toast.success("Utilizador criado com sucesso!");
            }
            router.push('/dashboard/usuarios');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha na operação.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Secção de Detalhes do Utilizador */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Detalhes do Utilizador</h2>
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Nome Completo</label>
                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
                    {!isEditing && (
                        <div className="sm:col-span-3">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Palavra-passe Inicial</label>
                            <input type="password" name="password" id="password" required={!isEditing} value={formData.password} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300"/>
                        </div>
                    )}
                </div>
            </div>

            {/* Secção de Permissões e Associação */}
            <div className="border-t border-gray-900/10 pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Função e Unidade</h2>
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                        <label htmlFor="profile" className="block text-sm font-medium leading-6 text-gray-900">Perfil de Acesso</label>
                        <select id="profile" name="profile" value={formData.profile} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300">
                            <option value="normal">Normal (Profissional)</option>
                            <option value="master">Master (Gestor de Unidade)</option>
                            {loggedInUser?.profile === 'admin' && <option value="admin">Admin (Sistema)</option>}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="specialty_id" className="block text-sm font-medium leading-6 text-gray-900">Especialidade</label>
                        <select id="specialty_id" name="specialty_id" value={formData.specialty_id} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300">
                           {specialties.map(spec => <option key={spec.specialty_id} value={spec.specialty_id}>{spec.name}</option>)}
                        </select>
                    </div>
                     <div className="sm:col-span-2">
                        <label htmlFor="unit_id" className="block text-sm font-medium leading-6 text-gray-900">Unidade</label>
                        <select 
                            id="unit_id" 
                            name="unit_id" 
                            value={formData.unit_id} 
                            onChange={handleChange} 
                            // O seletor é desativado se o utilizador for 'master', pois ele só pode criar na sua própria unidade.
                            disabled={loggedInUser?.profile === 'master'} 
                            className="mt-2 block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                           {/* Se for admin, mostra a lista de unidades. */}
                           {loggedInUser?.profile === 'admin' && units.map(unit => 
                                <option key={unit.unit_id} value={unit.unit_id}>{unit.name}</option>
                           )}
                           {/* Se for master, mostra apenas a sua própria unidade. */}
                           {loggedInUser?.profile === 'master' && 
                                <option value={loggedInUser.unit_id}>{loggedInUser.unit_name || 'Minha Unidade'}</option>
                           }
                        </select>
                    </div>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex items-center justify-end gap-x-6 border-t pt-6">
                <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900">Cancelar</button>
                <button type="submit" disabled={isLoading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400">
                    {isLoading ? 'A criar...' : 'Criar Utilizador'}
                </button>
            </div>
        </form>
    );
}
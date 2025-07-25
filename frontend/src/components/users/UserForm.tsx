'use client';

import { Unit, Specialty, User } from '@/types';
import api from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PasswordInput from '../ui/PasswordInput';

interface UserFormProps {
    userToEdit?: User;
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
        password: '',
        profile: userToEdit?.profile || 'normal',
        unit_id: userToEdit?.unit_id || loggedInUser?.unit_id || '',
        specialty_id: userToEdit?.specialty_id || '',
        is_active: userToEdit?.is_active ?? true,
        has_agenda: userToEdit?.has_agenda ?? true,
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const promises = [
                    api.get('/specialties'),
                    loggedInUser?.profile === 'admin' ? api.get('/units') : Promise.resolve({ data: [] })
                ];

                const [specialtiesRes, unitsRes] = await Promise.all(promises);

                const fetchedSpecialties = specialtiesRes.data;
                const fetchedUnits = unitsRes.data;

                setSpecialties(fetchedSpecialties);
                setUnits(fetchedUnits);

                setFormData(prev => {
                    const newFormData = { ...prev };

                    if (!isEditing && fetchedSpecialties.length > 0) {
                        newFormData.specialty_id = fetchedSpecialties[0].specialty_id;
                    }

                    if (loggedInUser?.profile === 'admin' && !prev.unit_id && fetchedUnits.length > 0) {
                        newFormData.unit_id = fetchedUnits[0].unit_id;
                    }
                    
                    return newFormData;
                });

            } catch (error) {
                toast.error("Falha ao carregar dados do formulário.");
                console.error("Error fetching form data:", error);
            }
        };

        fetchDropdownData();
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
                const { password, ...updateData } = formData;
                if (!updateData.unit_id) delete (updateData as Partial<typeof updateData>).unit_id;
                
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
            {/* O seu JSX permanece o mesmo */}
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
                            <PasswordInput id="password_create" name="password" required={!isEditing} value={formData.password} onChange={handleChange} placeholder="••••••••"/>
                        </div>
                    )}
                </div>
            </div>
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
                    <div className="sm:col-span-2 flex items-end pb-1">
                        <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                                <input id="has_agenda" name="has_agenda" type="checkbox" checked={formData.has_agenda} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            </div>
                            <div className="text-sm leading-6">
                                <label htmlFor="has_agenda" className="font-medium text-gray-900">Profissional de Atendimento (tem agenda)</label>
                            </div>
                        </div>
                    </div>
                     <div className="sm:col-span-2">
                        <label htmlFor="unit_id" className="block text-sm font-medium leading-6 text-gray-900">Unidade</label>
                        <select 
                            id="unit_id" 
                            name="unit_id" 
                            value={formData.unit_id} 
                            onChange={handleChange} 
                            disabled={loggedInUser?.profile === 'master'} 
                            className="mt-2 block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                           {loggedInUser?.profile === 'admin' && units.map(unit => 
                                <option key={unit.unit_id} value={unit.unit_id}>{unit.name}</option>
                           )}
                           {loggedInUser?.profile === 'master' && 
                                <option value={loggedInUser.unit_id}>{loggedInUser.unit_name || 'Minha Unidade'}</option>
                           }
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-6 border-t pt-6">
                <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900">Cancelar</button>
                <button type="submit" disabled={isLoading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400">
                    {isLoading ? (isEditing ? 'A editar...' : 'A criar...') : 
                    isEditing ? 'Editar Utilizador' : 'Criar Utilizador'}
                </button>
            </div>
        </form>
    );
}

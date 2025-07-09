'use client';

import { Unit, Specialty } from '@/types';
import api from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function UserForm() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [units, setUnits] = useState<Unit[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        profile: 'normal',
        unit_id: user?.unit_id || '',
        specialty_id: '',
    });

    useEffect(() => {
        if (user?.profile === 'admin') {
            api.get('/units').then(res => {
                setUnits(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, unit_id: res.data[0].unit_id }));
                }
            });
        }
        api.get('/specialties').then(res => {
            setSpecialties(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, specialty_id: res.data[0].specialty_id }));
            }
        });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/users', formData);
            toast.success("Utilizador criado com sucesso!");
            router.push('/dashboard'); // Idealmente, para uma página de listagem de utilizadores
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao criar utilizador.");
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
                    <div className="sm:col-span-3">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Palavra-passe Inicial</label>
                        <input type="password" name="password" id="password" required value={formData.password} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
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
                            {user?.profile === 'admin' && <option value="admin">Admin (Sistema)</option>}
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
                            disabled={user?.profile === 'master'} 
                            className="mt-2 block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                           {/* Se for admin, mostra a lista de unidades. */}
                           {user?.profile === 'admin' && units.map(unit => 
                                <option key={unit.unit_id} value={unit.unit_id}>{unit.name}</option>
                           )}
                           {/* Se for master, mostra apenas a sua própria unidade. */}
                           {user?.profile === 'master' && 
                                <option value={user.unit_id}>{user.unit_name || 'Minha Unidade'}</option>
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
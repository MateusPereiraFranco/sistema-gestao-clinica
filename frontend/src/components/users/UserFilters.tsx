'use client';

import { useState } from 'react';
import { Specialty } from '@/types';
import { Search } from 'lucide-react';

interface UserFiltersProps {
    specialties: Specialty[];
    onSearch: (filters: { name: string; specialtyId: string }) => void;
    isLoading: boolean;
}

export default function UserFilters({ specialties, onSearch, isLoading }: UserFiltersProps) {
    const [name, setName] = useState('');
    const [specialtyId, setSpecialtyId] = useState('all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ name, specialtyId });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="name_user_filter" className="block text-sm font-medium text-gray-700">Nome do Utilizador</label>
                    <input type="text" id="name_user_filter" value={name} onChange={e => setName(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Procurar por nome..."/>
                </div>
                <div>
                    <label htmlFor="specialty_filter" className="block text-sm font-medium text-gray-700">Especialidade</label>
                    <select id="specialty_filter" value={specialtyId} onChange={e => setSpecialtyId(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                        <option value="all">Todas</option>
                        {specialties.map(spec => <option key={spec.specialty_id} value={spec.specialty_id}>{spec.name}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                    <Search className="w-5 h-5 mr-2"/>
                    {isLoading ? 'A buscar...' : 'Buscar'}
                </button>
            </form>
        </div>
    );
}
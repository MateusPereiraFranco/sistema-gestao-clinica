'use client';

import { useState } from 'react';
import { Specialty } from '@/types';
import { Search, Plus, X } from 'lucide-react'; // Importe os ícones
import { useFilterStore } from '@/stores/useFilterStore';
import api from '@/services/api'; // Importe sua instância da API
import toast from 'react-hot-toast';

interface UserFiltersProps {
    specialties: Specialty[];
    onSearch: (filters: { name: string; specialtyId: string, is_active: boolean }) => void;
    isLoading: boolean;
    // 1. Adicione uma nova prop para notificar a página pai sobre a nova especialidade
    onSpecialtyCreated: (newSpecialty: Specialty) => void; 
}

export default function UserFilters({ specialties, onSearch, isLoading, onSpecialtyCreated }: UserFiltersProps) {
    const { includeInactive, setIncludeInactive } = useFilterStore();
    const [name, setName] = useState('');
    const [specialtyId, setSpecialtyId] = useState('all');
    
    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ name, specialtyId, is_active: !includeInactive });
    };

    // Função para salvar a nova especialidade
    const handleSaveSpecialty = async () => {
        if (!newSpecialtyName.trim()) {
            toast.error("O nome da especialidade não pode estar vazio.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await api.post('/specialties', { name: newSpecialtyName });
            
            // Notifica a página pai com a nova especialidade retornada pela API
            onSpecialtyCreated(response.data);

            toast.success(`Especialidade "${newSpecialtyName}" criada com sucesso!`);
            setIsModalOpen(false); // Fecha o modal
            setNewSpecialtyName(''); // Limpa o campo
        } catch (error: any) {
            if (error.response && error.response.data?.message.includes('duplicate key')) {
                toast.error("Esta especialidade já existe.");
            } else {
                toast.error("Erro ao criar a especialidade.");
            }
            console.error("Erro ao salvar especialidade:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="name_user_filter" className="block text-sm font-medium text-gray-700">Nome do Utilizador</label>
                        <input type="text" id="name_user_filter" value={name} onChange={e => setName(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Procurar por nome..."/>
                    </div>
                    <div>
                        <label htmlFor="specialty_filter" className="block text-sm font-medium text-gray-700">Especialidade</label>
                        {/* 2. Coloque o select e o botão lado a lado */}
                        <div className="flex items-center gap-2 mt-1">
                            <select id="specialty_filter" value={specialtyId} onChange={e => setSpecialtyId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="all">Todas</option>
                                {specialties.map(spec => <option key={spec.specialty_id} value={spec.specialty_id}>{spec.name}</option>)}
                            </select>
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(true)}
                                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                title="Adicionar nova especialidade"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="include_inactive_agenda" checked={includeInactive}
                            onChange={(e) => setIncludeInactive(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                        <label htmlFor="include_inactive_agenda" className="text-sm text-gray-700">Incluir inativos</label>
                    </div>
                    <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                        <Search className="w-5 h-5 mr-2"/>
                        {isLoading ? 'A buscar...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {/* 3. Modal para adicionar nova especialidade */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Nova Especialidade</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div>
                            <label htmlFor="new_specialty_name" className="block text-sm font-medium text-gray-700">Nome da Especialidade</label>
                            <input
                                id="new_specialty_name"
                                type="text"
                                value={newSpecialtyName}
                                onChange={(e) => setNewSpecialtyName(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Ex: Fisioterapia"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button 
                                onClick={handleSaveSpecialty} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400"
                            >
                                {isSaving ? 'A salvar...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

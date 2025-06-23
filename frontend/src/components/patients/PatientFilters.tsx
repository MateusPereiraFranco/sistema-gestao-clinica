'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Patient } from '@/types';
import api from '@/services/api';
import { Search } from 'lucide-react';

interface PatientFiltersProps {
    onSearch: (filters: Record<string, string>) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export default function PatientFilters({ onSearch, setIsLoading }: PatientFiltersProps) {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState(''); // Novo estado para nome da mãe
    const [cpf, setCpf] = useState('');
    
    const [liveSuggestions, setLiveSuggestions] = useState<Patient[]>([]);
    const debouncedName = useDebounce(name, 300);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedName.length > 2) {
                try {
                    const response = await api.get('/patients', { params: { name: debouncedName } });
                    setLiveSuggestions(response.data);
                } catch (error) {
                    console.error("Erro na busca ao vivo:", error);
                    setLiveSuggestions([]);
                }
            } else {
                setLiveSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedName]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const filters: Record<string, string> = {};
        if (name) filters.name = name;
        if (motherName) filters.mother_name = motherName; // Adiciona nome da mãe aos filtros
        if (cpf) filters.cpf = cpf;
        
        onSearch(filters);
        setLiveSuggestions([]);
    };
    
    const handleSuggestionClick = (patient: Patient) => {
        setName(patient.name);
        setMotherName(patient.mother_name || '');
        setCpf(patient.cpf || '');
        setLiveSuggestions([]);
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Filtro de Nome com Sugestões */}
                <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Paciente</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Digite para buscar..."
                    />
                    {liveSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                            {liveSuggestions.map(p => (
                                <li key={p.patient_id} onClick={() => handleSuggestionClick(p)} className="px-4 py-3 cursor-pointer hover:bg-indigo-50">
                                    <p className="font-semibold text-gray-800">{p.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Mãe: {p.mother_name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Filtro por Nome da Mãe */}
                <div>
                    <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">Nome da Mãe</label>
                    <input type="text" id="motherName" value={motherName} onChange={(e) => setMotherName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nome da mãe para desempate"
                    />
                </div>

                {/* Filtro de CPF */}
                <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="000.000.000-00"
                    />
                </div>

                {/* Botão de Busca */}
                <button type="submit"
                    className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Search className="w-5 h-5 mr-2"/>
                    Buscar
                </button>
            </form>
        </div>
    );
}
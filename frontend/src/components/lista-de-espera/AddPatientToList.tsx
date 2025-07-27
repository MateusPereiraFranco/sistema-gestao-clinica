'use client';

import { useState } from 'react';
import { Patient } from '@/types';
import api from '@/services/api';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCNS, maskCPF } from '@/utils/masks';

interface AddPatientToListProps {
    onPatientSelect: (patient: Patient) => void;
}

export default function AddPatientToList({ onPatientSelect }: AddPatientToListProps) {
    const [filters, setFilters] = useState({ name: '', mother_name: '', cpf: '', cns: '' });
    const [results, setResults] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let maskedValue = value;
        if (name === 'cpf') maskedValue = maskCPF(value);
        if (name === 'cns') maskedValue = maskCNS(value);
        setFilters(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
        if (Object.keys(activeFilters).length === 0) {
            toast.error("Preencha pelo menos um campo para buscar.");
            return;
        }
        
        setIsLoading(true);
        setHasSearched(true);
        try {
            const response = await api.get('/patients', { params: activeFilters });
            setResults(response.data);
        } catch (error) {
            toast.error("Erro ao buscar pacientes.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Adicionar Paciente à Lista de Espera</h3>
            {/* 1. O grid foi ajustado para ser mais responsivo */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Em telemóveis, cada campo ocupa uma linha. Em ecrãs maiores, eles se distribuem. */}
                <div className="sm:col-span-2">
                    <label htmlFor="name_waitlist" className="block text-sm font-medium text-gray-700">Nome do Paciente</label>
                    <input type="text" name="name" id="name_waitlist" value={filters.name} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                    <label htmlFor="mother_name_waitlist" className="block text-sm font-medium text-gray-700">Nome da Mãe</label>
                    <input type="text" name="mother_name" id="mother_name_waitlist" value={filters.mother_name} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="cpf_waitlist" className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" name="cpf" id="cpf_waitlist" value={filters.cpf} onChange={handleFilterChange} maxLength={14} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="cns_waitlist" className="block text-sm font-medium text-gray-700">CNS</label>
                    <input type="text" name="cns" id="cns_waitlist" value={filters.cns} onChange={handleFilterChange} maxLength={18} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <button type="submit" disabled={isLoading} className="sm:col-span-full lg:col-span-1 flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                    <Search className="w-5 h-5 mr-2"/>
                    {isLoading ? 'A buscar...' : 'Buscar'}
                </button>
            </form>

            {hasSearched && !isLoading && (
                <div className="mt-6 border-t pt-4">
                    {results.length > 0 ? (
                        <ul className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Resultados da Busca:</h4>
                            {results.map(patient => (
                                <li key={patient.patient_id} onClick={() => onPatientSelect(patient)}
                                    className="p-3 rounded-md cursor-pointer hover:bg-indigo-50 flex justify-between items-center border">
                                    <div>
                                        <p className="font-semibold text-gray-800">{patient.name}</p>
                                        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:gap-x-3 mt-1">
                                            <span>Mãe: {patient.mother_name}</span>
                                            <span>Nasc: {patient.birth_date_formatted}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-600 text-right">Adicionar à Lista</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum paciente encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
}

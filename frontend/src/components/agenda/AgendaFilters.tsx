'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaFiltersProps {
    professionals: User[];
}

export default function AgendaFilters({ professionals }: AgendaFiltersProps) {
    const { 
        includeInactive, setIncludeInactive,
        agendaProfessional, setAgendaProfessional, 
        agendaDate, setAgendaDate, 
    } = useFilterStore();
    
    const handleDateChange = (days: number) => {
        const currentDate = new Date(`${agendaDate}T12:00:00Z`);
        currentDate.setDate(currentDate.getDate() + days);
        setAgendaDate(currentDate.toISOString().split('T')[0]);
    };

    return (
        // 1. O container principal foi alterado para um grid responsivo.
        // - Em telemóveis: 1 coluna
        // - Em ecrãs maiores (lg:): 3 colunas
        <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            
            {/* 2. Cada filtro agora tem uma label por cima do campo para melhor organização. */}
            <div>
                <label htmlFor="professional_agenda_filter" className="block text-sm font-medium text-gray-700">Profissional</label>
                <select
                    id="professional_agenda_filter"
                    value={agendaProfessional}
                    onChange={(e) => setAgendaProfessional(e.target.value)}
                    // w-full garante que o campo ocupe todo o espaço da sua coluna.
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    {professionals.map(pro => (
                        <option key={pro.user_id} value={pro.user_id}>{pro.name} ({pro.specialty_name || 'N/A'})</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <div className="mt-1 flex items-center">
                    <button onClick={() => handleDateChange(-1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                    <input
                        type="date"
                        value={agendaDate}
                        onChange={(e) => setAgendaDate(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button onClick={() => handleDateChange(1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex items-center pb-1">
                <input type="checkbox" id="include_inactive_agenda" checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                <label htmlFor="include_inactive_agenda" className="ml-2 text-sm text-gray-700">Incluir inativos</label>
            </div>
        </div>
    );
}

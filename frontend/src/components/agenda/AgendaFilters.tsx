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
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-2">
                <label htmlFor="professional_agenda_filter" className="text-sm font-medium text-gray-700">Profissional:</label>
                <select
                    id="professional_agenda_filter"
                    value={agendaProfessional}
                    onChange={(e) => setAgendaProfessional(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    {/* A opção "Todos" foi removida anteriormente, como solicitado. */}
                    {professionals.map(pro => (
                        <option key={pro.user_id} value={pro.user_id}>{pro.name} ({pro.specialty_name || 'N/A'})</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={() => handleDateChange(-1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                <input
                    type="date"
                    value={agendaDate}
                    onChange={(e) => setAgendaDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button onClick={() => handleDateChange(1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="include_inactive_agenda" checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                <label htmlFor="include_inactive_agenda" className="text-sm text-gray-700">Incluir inativos</label>
            </div>
        </div>
    );
}
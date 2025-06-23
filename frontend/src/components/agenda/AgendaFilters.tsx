'use client';

import { User } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaFiltersProps {
    professionals: User[];
    selectedProfessional: string;
    setSelectedProfessional: (id: string) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

export default function AgendaFilters({
    professionals,
    selectedProfessional,
    setSelectedProfessional,
    selectedDate,
    setSelectedDate,
}: AgendaFiltersProps) {

    const handleDateChange = (days: number) => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + days);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            {/* Seletor de Profissional */}
            <div>
                <label htmlFor="professional" className="text-sm font-medium text-gray-700 mr-2">Profissional:</label>
                <select
                    id="professional"
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    {professionals.map(pro => (
                        <option key={pro.user_id} value={pro.user_id}>{pro.name} ({pro.specialty_name || 'N/A'})</option>
                    ))}
                </select>
            </div>

            {/* Seletor de Data */}
            <div className="flex items-center gap-2">
                <button onClick={() => handleDateChange(-1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button onClick={() => handleDateChange(1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
            </div>
        </div>
    );
}
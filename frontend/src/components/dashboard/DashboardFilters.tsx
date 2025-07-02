'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardFiltersProps {
    professionals: User[];
}

export default function DashboardFilters({ professionals }: DashboardFiltersProps) {
    const { dashboardProfessional, setDashboardProfessional, dashboardPeriod, setDashboardPeriod, dashboardDate, setDashboardDate, } = useFilterStore();
    const handleDateChange = (days: number) => {
        const currentDate = new Date(`${dashboardDate}T12:00:00Z`);
        currentDate.setDate(currentDate.getDate() + days);
        setDashboardDate(currentDate.toISOString().split('T')[0]);
    };
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-2">
                <label htmlFor="professional_dashboard_filter" className="text-sm font-medium text-gray-700">Profissional:</label>
                <select
                    id="professional_dashboard_filter"
                    value={dashboardProfessional}
                    onChange={(e) => setDashboardProfessional(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="all">Todos os Profissionais</option>
                    {professionals.map(pro => (
                        <option key={pro.user_id} value={pro.user_id}>{pro.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                 <label htmlFor="period_dashboard_filter" className="text-sm font-medium text-gray-700">Período:</label>
                 <select
                    id="period_dashboard_filter"
                    value={dashboardPeriod}
                    onChange={(e) => setDashboardPeriod(e.target.value as any)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="todos">Dia Inteiro</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                </select>
            </div>
            {/* Seletor de Data Adicionado */}
            <div className="flex items-center gap-2">
                <button onClick={() => handleDateChange(-1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                <input
                    type="date"
                    value={dashboardDate}
                    onChange={(e) => setDashboardDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button onClick={() => handleDateChange(1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
            </div>
        </div>
    );
}
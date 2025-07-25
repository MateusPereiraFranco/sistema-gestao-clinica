'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardFiltersProps {
    professionals: User[];
}

export default function DashboardFilters({ professionals }: DashboardFiltersProps) {
    const { dashboardProfessional, setDashboardProfessional, dashboardPeriod, setDashboardPeriod, dashboardDate, setDashboardDate, includeInactive, setIncludeInactive  } = useFilterStore();
    
    const handleDateChange = (days: number) => {
        const currentDate = new Date(`${dashboardDate}T12:00:00Z`);
        currentDate.setDate(currentDate.getDate() + days);
        setDashboardDate(currentDate.toISOString().split('T')[0]);
    };

    return (
        // 1. O container principal foi alterado para um grid responsivo.
        // - Em telemóveis (padrão): 1 coluna (grid-cols-1)
        // - Em tablets (sm:): 2 colunas (sm:grid-cols-2)
        // - Em portáteis (lg:): 4 colunas (lg:grid-cols-4)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            
            {/* 2. Cada filtro agora tem uma label por cima do campo. */}
            <div>
                <label htmlFor="professional_dashboard_filter" className="block text-sm font-medium text-gray-700">Profissional</label>
                <select
                    id="professional_dashboard_filter"
                    value={dashboardProfessional}
                    onChange={(e) => setDashboardProfessional(e.target.value)}
                    // A classe w-full garante que o campo ocupe todo o espaço da sua coluna no grid.
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="all">Todos os Profissionais</option>
                    {professionals.map(pro => (
                        <option key={pro.user_id} value={pro.user_id}>{pro.name}</option>
                    ))}
                </select>
            </div>

            <div>
                 <label htmlFor="period_dashboard_filter" className="block text-sm font-medium text-gray-700">Período</label>
                 <select
                    id="period_dashboard_filter"
                    value={dashboardPeriod}
                    onChange={(e) => setDashboardPeriod(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="todos">Dia Inteiro</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <div className="mt-1 flex items-center">
                    <button onClick={() => handleDateChange(-1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                    <input
                        type="date"
                        value={dashboardDate}
                        onChange={(e) => setDashboardDate(e.target.value)}
                        // A classe w-full faz o input crescer para preencher o espaço.
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button onClick={() => handleDateChange(1)} className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* 3. O checkbox é alinhado com os outros campos. */}
            <div className="flex items-center pb-1">
                <input type="checkbox" id="include_inactive_dashboard" checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                <label htmlFor="include_inactive_dashboard" className="ml-2 text-sm text-gray-700">Incluir inativos</label>
            </div>
        </div>
    );
}

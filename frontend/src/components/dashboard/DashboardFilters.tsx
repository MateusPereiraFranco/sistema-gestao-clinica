'use client';

import { User } from '@/types';

interface DashboardFiltersProps {
    professionals: User[];
    selectedProfessional: string;
    setSelectedProfessional: (id: string) => void;
}

export default function DashboardFilters({
    professionals,
    selectedProfessional,
    setSelectedProfessional,
}: DashboardFiltersProps) {
    // A restrição foi removida. O seletor agora é sempre ativo.
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            <label htmlFor="professional_dashboard_filter" className="text-sm font-medium text-gray-700">A ver fila de:</label>
            <select
                id="professional_dashboard_filter"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                {/* A opção "Todos" agora está sempre disponível */}
                <option value="all">Todos os Profissionais</option>
                {professionals.map(pro => (
                    <option key={pro.user_id} value={pro.user_id}>{pro.name}</option>
                ))}
            </select>
        </div>
    );
}
'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';

interface WaitingListFiltersProps {
    professionals: User[];
}

export default function WaitingListFilters({ professionals }: WaitingListFiltersProps) {
    const { waitingListProfessional, setWaitingListProfessional } = useFilterStore();
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
            <label htmlFor="professional_waitlist_filter" className="text-sm font-medium text-gray-700">A ver lista de:</label>
            <select
                id="professional_waitlist_filter"
                value={waitingListProfessional}
                onChange={(e) => setWaitingListProfessional(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                {<option value="all">Todos os Profissionais</option>}
                {professionals.map(pro => (
                    <option key={pro.user_id} value={pro.user_id}>{pro.name}</option>
                ))}
            </select>
        </div>
    );
}
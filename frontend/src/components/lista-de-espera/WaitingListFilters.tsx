'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';
import { Search } from 'lucide-react';

interface WaitingListFiltersProps {
    professionals: User[];
    onSearch: () => void;
    isLoading: boolean;
}

export default function WaitingListFilters({ professionals, onSearch, isLoading }: WaitingListFiltersProps) {
    const { 
        waitingListProfessional, setWaitingListProfessional, waitingListStartDate, setWaitingListStartDate, waitingListEndDate, setWaitingListEndDate 
    } = useFilterStore();
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="professional_waitlist_filter" className="block text-sm font-medium text-gray-700">Profissional</label>
                    <select
                        id="professional_waitlist_filter"
                        value={waitingListProfessional}
                        onChange={(e) => setWaitingListProfessional(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="all">Todos os Profissionais</option>
                        {professionals.map(pro => (
                            <option key={pro.user_id} value={pro.user_id}>{pro.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="start_date_waitlist" className="block text-sm font-medium text-gray-700">De</label>
                    <input type="date" id="start_date_waitlist" value={waitingListStartDate} onChange={e => setWaitingListStartDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="end_date_waitlist" className="block text-sm font-medium text-gray-700">Até</label>
                    <input type="date" id="end_date_waitlist" value={waitingListEndDate} onChange={e => setWaitingListEndDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <button onClick={onSearch} disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                    <Search className="w-5 h-5 mr-2"/>
                    {isLoading ? 'A buscar...' : 'Buscar'}
                </button>
            </div>
        </div>
    );
}
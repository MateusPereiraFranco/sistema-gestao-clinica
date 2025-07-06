'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { User } from '@/types';
import { Search } from 'lucide-react';

interface ReportFiltersProps {
    professionals: User[];
    onSearch: () => void;
    isLoading: boolean;
}

export default function ReportFilters({ professionals, onSearch, isLoading }: ReportFiltersProps) {
    const {
        reportProfessional, setReportProfessional,
        reportStartDate, setReportStartDate,
        reportEndDate, setReportEndDate
    } = useFilterStore();

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Profissional</label>
                    <select value={reportProfessional} onChange={e => setReportProfessional(e.target.value)}
                        className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100">
                        <option value="all">Todos os Profissionais</option>
                        {professionals.map(p => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">De</label>
                    <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Até</label>
                    <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <button onClick={onSearch} disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                    <Search className="w-5 h-5 mr-2"/>
                    {isLoading ? 'A gerar...' : 'Gerar Relatório'}
                </button>
            </div>
        </div>
    );
}
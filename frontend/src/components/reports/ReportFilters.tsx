'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { AppointmentStatus, User } from '@/types';
import { Search } from 'lucide-react';
import { statusLabels } from '@/utils/statusUtils';

interface ReportFiltersProps {
    professionals: User[];
    status: AppointmentStatus[];
    onSearch: () => void;
    isLoading: boolean;
}

export default function ReportFilters({ professionals, status, onSearch, isLoading }: ReportFiltersProps) {
    
    const {
        reportProfessional, setReportProfessional,
        reportStatus, setReportStatus,
        reportStartDate, setReportStartDate,
        reportEndDate, setReportEndDate,
        includeInactive, setIncludeInactive
    } = useFilterStore();
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">Situação</label>
                    <select 
                        value={reportStatus} 
                        onChange={e => setReportStatus(e.target.value as AppointmentStatus)}
                        className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100"
                    >
                        <option value="all">Todos os status</option>
                        {status.map(s => (
                            <option key={s} value={s}>
                                {statusLabels[s] || s}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={onSearch} disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                    <Search className="w-5 h-5 mr-2"/>
                    {isLoading ? 'A gerar...' : 'Gerar Relatório'}
                </button>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="include_inactive_dashboard" checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                    <label htmlFor="include_inactive_dashboard" className="text-sm text-gray-700">Incluir profissionais inativos</label>
                </div>
            </div>
        </div>
    );
}
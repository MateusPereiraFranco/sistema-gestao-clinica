'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { Appointment, AppointmentStatus, User } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFilterStore } from "@/stores/useFilterStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface HistoryData {
    patient_id: string;
    name: string;
    history: (Omit<Appointment, 'status'> & { status: AppointmentStatus })[];
}

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const statusInfo = {
        scheduled: { text: "Agendado", style: "bg-gray-200 text-gray-800" },
        waiting: { text: "Aguardando", style: "bg-blue-100 text-blue-800" },
        in_progress: { text: "Em Atendimento", style: "bg-yellow-100 text-yellow-800" },
        on_waiting_list: { text: "Em Lista de Espera", style: "bg-orange-100 text-orange-800" },
        completed: { text: "Concluído", style: "bg-green-100 text-green-800" },
        justified_absence: { text: "Falta Justificada", style: "bg-red-100 text-red-800" },
        unjustified_absence: { text: "Faltou", style: "bg-red-200 text-red-900 font-bold" },
        canceled: { text: "Cancelado", style: "bg-gray-300 text-gray-900" },
    };
    const info = statusInfo[status] || statusInfo.scheduled;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${info.style}`}>{info.text}</span>;
};

export default function ProntuarioPage() {
    const { user } = useAuthStore();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const { dashboardProfessional, setDashboardProfessional} = useFilterStore();
    const params = useParams();
    const patientId = params.patientId as string;

    const [patientName, setPatientName] = useState('');
    const [history, setHistory] = useState<HistoryData['history']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para os filtros de data
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchHistory = useCallback(async () => {
        if (!patientId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/patients/${patientId}/history`, {
                params: { startDate, endDate, professional_id: dashboardProfessional }
            });
            setPatientName(response.data.name);
            setHistory(response.data.history);
        } catch (err) {
            setError("Não foi possível carregar o histórico do paciente.");
            toast.error("Falha ao carregar histórico.");
        } finally {
            setIsLoading(false);
        }
    }, [patientId, startDate, endDate, dashboardProfessional]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory, dashboardProfessional]);

    useEffect(() => {
        const fetchProfessionals = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users', {params: {is_active: true, professional_id: dashboardProfessional}});
                const professionalList: User[] = response.data.filter((u: User) => u.has_agenda === true);
                setProfessionals(professionalList);
                
                if (user.profile === 'normal') {
                    setDashboardProfessional(user.user_id);
                }
            } catch (error) { console.error(error); }
        };
        fetchProfessionals();
    }, [user, setDashboardProfessional]);

    return (
        <>
            <Header title={`Prontuário de ${patientName || 'Paciente'}`} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Componente de Filtros */}
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="start_date_history" className="block text-sm font-medium text-gray-700">De</label>
                            <input type="date" id="start_date_history" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="end_date_history" className="block text-sm font-medium text-gray-700">Até</label>
                            <input type="date" id="end_date_history" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div className="flex items-center justify-center gap-2">
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
                        <button onClick={fetchHistory} disabled={isLoading} className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                            <Search className="w-5 h-5 mr-2"/>
                            {isLoading ? 'A filtrar...' : 'Filtrar'}
                        </button>
                    </div>
                </div>

                {/* Tabela de Histórico */}
                {isLoading ? (
                    <p className="text-center">A carregar prontuário...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observação</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Ação</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map(item => (
                                    <tr key={item.appointment_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.professional_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.service_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.observations}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {item.status === 'completed' && (
                                                <Link href={`/dashboard/atendimento/${item.appointment_id}/visualizar`}
                                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1">
                                                    <Eye size={16} /> Visualizar
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {history.length === 0 && (
                            <p className="text-center text-gray-500 p-8">Nenhum atendimento registado para este paciente no período selecionado.</p>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}
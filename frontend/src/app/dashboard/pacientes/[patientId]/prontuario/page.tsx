'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { Appointment, AppointmentStatus } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Link from "next/link";

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
        completed: { text: "Concluído", style: "bg-green-100 text-green-800" },
        justified_absence: { text: "Falta Justificada", style: "bg-red-100 text-red-800" },
        unjustified_absence: { text: "Faltou", style: "bg-red-200 text-red-900 font-bold" },
    };
    const info = statusInfo[status] || statusInfo.scheduled;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${info.style}`}>{info.text}</span>;
};

export default function ProntuarioPage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const router = useRouter();

    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patientId) {
            api.get(`/patients/${patientId}/history`)
                .then(response => setHistoryData(response.data))
                .catch(() => setError("Não foi possível carregar o histórico do paciente."))
                .finally(() => setIsLoading(false));
        }
    }, [patientId]);

    if (isLoading) return <div className="p-6">A carregar prontuário...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <>
            <Header title={`Prontuário de ${historyData?.name || 'Paciente'}`} />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Ação</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {historyData?.history.map(item => (
                                <tr key={item.appointment_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.professional_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.service_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Link href={`/dashboard/atendimento/${item.appointment_id}/visualizar`}
                                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1">
                                            <Eye size={16} /> Visualizar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {historyData?.history.length === 0 && (
                        <p className="text-center text-gray-500 p-8">Nenhum atendimento registado para este paciente.</p>
                    )}
                </div>
            </main>
        </>
    );
}
'use client';

import { Appointment } from "@/types";
import { Stethoscope } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface WaitingListTableProps {
    list: Appointment[];
    isLoading: boolean;
    refreshList: () => void;
}

export default function WaitingListTable({ list, isLoading, refreshList }: WaitingListTableProps) {
    const { user } = useAuthStore();
    const router = useRouter();

    const handleAttend = async (appointment: Appointment) => {
        const toastId = toast.loading("A iniciar atendimento...");
        try {
            console.log("to aqui")
            await api.patch(`/appointments/${appointment.appointment_id}/check-in`);
            console.log('Check-in realizado com sucesso');
            await api.patch(`/appointments/${appointment.appointment_id}/start-service`);
            console.log('Atendimento iniciado com sucesso');
            toast.success("Atendimento iniciado!", { id: toastId });
            router.push(`/dashboard/atendimento/${appointment.appointment_id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Não foi possível iniciar.", { id: toastId });
        }
    };

    if (isLoading) return <p className="text-center p-8">A carregar lista...</p>;
    if (list.length === 0) return <p className="text-center p-8">A lista de espera está vazia.</p>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aguardando por</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitado em</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ação</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {list.map(item => {
                        console.log(item);
                        const canAttend = user?.profile === 'master' || user?.user_id === item.professional_id;
                        return (
                            <tr key={item.appointment_id}>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{item.patient_name}</p>
                                    <div className="text-sm text-gray-500 space-y-1 mt-1">
                                        <p>Mãe: {item.patient_mother_name}</p>
                                        <p>CPF: {item.patient_cpf || 'N/A'}</p>
                                        <p>DataNasc: {item.patient_birth_date || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.professional_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.date_formatted}</td>
                                {item.service_type && item.service_type === 'Retorno' ? (
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.observations}</td>
                                ) : (
                                    <td className="px-6 py-4 text-sm text-gray-700">N/A</td>
                                )}
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleAttend(item)} disabled={!canAttend}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        <Stethoscope size={16} /> Atender
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
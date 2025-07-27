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
            await api.patch(`/appointments/${appointment.appointment_id}/attend-from-waitlist`);
            toast.success("Atendimento iniciado!", { id: toastId });
            router.push(`/dashboard/atendimento/${appointment.appointment_id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Não foi possível iniciar.", { id: toastId });
        }
    };

    if (isLoading) return <p className="text-center p-8">A carregar lista...</p>;
    if (list.length === 0) return <p className="text-center p-8 bg-white rounded-lg shadow">A lista de espera está vazia.</p>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 1. Tabela para ecrãs médios e maiores (md:) */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aguardando por</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitado em</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ação</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {list.map(item => {
                        const canAttend = user?.user_id === item.professional_id;
                        return (
                            <tr key={item.appointment_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{item.patient_name}</p>
                                    <p className="text-sm text-gray-500 mt-1">CPF: {item.patient_cpf || 'N/A'}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.professional_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.service_type}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.date_formatted}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={item.observations? item.observations : ''}>{item.observations || 'N/A'}</td>
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

            {/* 2. Visualização em "cartões" para telemóveis (md:hidden) */}
            <div className="md:hidden">
                {list.map(item => {
                    const canAttend = user?.user_id === item.professional_id;
                    return (
                        <div key={item.appointment_id} className="border-b p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-indigo-700">{item.patient_name}</p>
                                    <p className="text-sm text-gray-500">CPF: {item.patient_cpf || 'N/A'}</p>
                                </div>
                                <button onClick={() => handleAttend(item)} disabled={!canAttend}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0 ml-4">
                                    <Stethoscope size={16} /> Atender
                                </button>
                            </div>
                            <div className="mt-3 pt-3 border-t text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                    <p className="font-medium text-gray-400 text-xs">Aguardando por</p>
                                    <p>{item.professional_name}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-400 text-xs">Serviço</p>
                                    <p>{item.service_type || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium text-gray-400 text-xs">Solicitado em</p>
                                    <p>{item.date_formatted}</p>
                                </div>
                                {item.observations && (
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-400 text-xs">Observações</p>
                                        <p className="whitespace-pre-wrap">{item.observations}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

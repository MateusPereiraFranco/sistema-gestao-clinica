'use client';

import { Appointment, PatientVinculo } from "@/types";
import { Stethoscope, Clock, UserCheck, Eye, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

interface WaitingQueueProps {
    queue: Appointment[];
    isLoading: boolean;
    showProfessionalName?: boolean;
    onCancel: (appointmentId: string) => void;
    onStartService: (appointmentId: string) => void;
}

const getVinculoStyle = (vinculo: PatientVinculo | null) => {
    switch (vinculo) {
        case 'saude': return { bg: 'bg-pink-50', textColor: 'text-pink-800', borderColor: 'border-pink-500' };
        case 'educação': return { bg: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-500' };
        case 'AMA': return { bg: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-500' };
        default: return { bg: 'bg-indigo-50', textColor: 'text-indigo-800', borderColor: 'border-indigo-500' };
    }
}

export default function WaitingQueue({ queue, isLoading, showProfessionalName = false, onCancel, onStartService }: WaitingQueueProps) {
    const { user } = useAuthStore();

    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">A carregar fila de atendimento...</div>;
    }

    if (queue.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700">A fila de atendimento está vazia.</h3>
                <p className="text-gray-500 mt-2">Navegue para a página de Pacientes para lançar um atendimento ou para a Agenda para fazer o check-in.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {queue.map(item => {
                const vinculoStyle = getVinculoStyle(item.vinculo);
                const canAttend = user?.user_id === item.professional_id;
                return (
                    <div key={item.appointment_id} className={`p-4 bg-white rounded-lg shadow-sm flex items-center justify-between border-l-4 ${vinculoStyle.borderColor}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${vinculoStyle.bg}`}>
                                <UserCheck className={`w-6 h-6 ${vinculoStyle.textColor}`} />
                            </div>
                            <div>
                                <p className={`font-bold text-lg ${vinculoStyle.textColor}`}>{item.patient_name}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> Na fila desde às {item.time}</span>
                                    {showProfessionalName && <span className="font-medium text-gray-600">para {item.professional_name}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.status === 'completed' ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-green-600 font-semibold">Atendido</span>
                                    <Link href={`/dashboard/atendimento/${item.appointment_id}/visualizar`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold p-2 rounded hover:bg-gray-100" title="Ver Ficha">
                                        <Eye size={14} />
                                    </Link>
                                </div>
                            ) : (
                            item.status === 'canceled' ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-red-600 font-semibold">Cancelado</span>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => onStartService(item.appointment_id)}
                                        disabled={!canAttend}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed enabled:hover:bg-indigo-700"
                                    >
                                        <Stethoscope size={18} />
                                        {item.status === 'in_progress' ? 'Continuar' : 'Atender'}
                                    </button>
                                    {user?.profile === 'master' && (
                                    <button
                                        onClick={() => onCancel(item.appointment_id)}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-700 font-semibold p-2 rounded hover:bg-red-50"
                                        title="Cancelar Atendimento"
                                    >
                                        <XCircle size={18} />Cancelar
                                    </button>
                                    )}
                                </>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
'use client';

import { Appointment, PatientVinculo } from "@/types";
import { Stethoscope, Clock, UserCheck } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

interface WaitingQueueProps {
    queue: Appointment[];
    isLoading: boolean;
    showProfessionalName?: boolean;
}

const getVinculoStyle = (vinculo: PatientVinculo | null) => {
    switch (vinculo) {
        case 'saude': return { bg: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-500' };
        case 'educação': return { bg: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-500' };
        case 'AMA': return { bg: 'bg-pink-50', textColor: 'text-pink-800', borderColor: 'border-pink-500' };
        default: return { bg: 'bg-indigo-50', textColor: 'text-indigo-800', borderColor: 'border-indigo-500' };
    }
}

export default function WaitingQueue({ queue, isLoading, showProfessionalName = false }: WaitingQueueProps) {
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
                const canAttend = user?.profile === 'master' || user?.user_id === item.professional_id;
                
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
                        <Link 
                            href={`/dashboard/atendimento/${item.appointment_id}`}
                            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm transition-colors
                                ${canAttend ? 'hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'}`
                            }
                            onClick={(e) => {
                                if (!canAttend) {
                                    e.preventDefault();
                                    toast.error("Apenas o profissional responsável pode atender.");
                                }
                            }}
                        >
                            <Stethoscope size={18} />
                            {item.status === 'in_progress' ? 'Continuar' : 'Atender'}
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}
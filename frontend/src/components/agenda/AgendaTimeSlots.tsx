'use client';

import { Appointment, PatientVinculo} from "@/types";
import { Clock, Plus, MessageSquare, CheckCircle, UserX, UserCheck, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore"; // Importar a store de autenticação
import { useRouter } from "next/navigation"; // Importar o router para navegação
import api from "@/services/api"; // Importar a nossa instância do axios
import toast from "react-hot-toast";

interface AgendaTimeSlotsProps {
    appointments: Appointment[];
    isLoading: boolean;
    onCheckIn: (appointmentId: string) => void;
    onMarkAsMissed: (appointment: Appointment) => void;
    onScheduleClick: (slot: string) => void;
    refreshAgenda: () => void;
}

// Função auxiliar para obter a cor do vínculo
const getVinculoStyle = (vinculo: PatientVinculo | null) => {
    switch (vinculo) {
        case 'saude': return { borderColor: 'border-blue-500', textColor: 'text-blue-700' };
        case 'educação': return { borderColor: 'border-green-500', textColor: 'text-green-700' };
        case 'AMA': return { borderColor: 'border-pink-500', textColor: 'text-pink-700' };
        default: return { borderColor: 'border-indigo-500', textColor: 'text-indigo-700' };
    }
}

const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
    const statusInfo = {
        scheduled: { text: "Agendado", style: "bg-gray-200 text-gray-800" },
        waiting: { text: "Aguardando", style: "bg-blue-100 text-blue-800 animate-pulse" },
        in_progress: { text: "Em Atendimento", style: "bg-yellow-100 text-yellow-800" },
        completed: { text: "Concluído", style: "bg-green-100 text-green-800" },
        justified_absence: { text: "Falta Justificada", style: "bg-red-100 text-red-800" },
        unjustified_absence: { text: "Faltou", style: "bg-red-200 text-red-900 font-bold" },
    };
    const info = statusInfo[status] || statusInfo.scheduled;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${info.style}`}>{info.text}</span>;
};

export default function AgendaTimeSlots({ appointments, isLoading, onCheckIn, onMarkAsMissed, onScheduleClick, refreshAgenda }: AgendaTimeSlotsProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [expandedObservationId, setExpandedObservationId] = useState<string | null>(null);

    const handleStartService = async (appointmentId: string) => {
        const toastId = toast.loading("A iniciar atendimento...");
        try {
            await api.patch(`/appointments/${appointmentId}/start-service`);
            toast.success("Atendimento iniciado.", { id: toastId });
            refreshAgenda();
            router.push(`/dashboard/atendimento/${appointmentId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Não foi possível iniciar o atendimento.", { id: toastId });
        }
    };

    const handleToggleObservation = (appointmentId: string) => {
        setExpandedObservationId(prevId => (prevId === appointmentId ? null : appointmentId));
    };
    
    const timeSlots = Array.from({ length: 20 }, (_, i) => `${String(8 + Math.floor((i * 30) / 60)).padStart(2, '0')}:${String((i * 30) % 60).padStart(2, '0')}`);

    if (isLoading) {
        return <div className="text-center p-10 text-gray-500">A carregar agenda...</div>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeSlots.map(slot => {
                const appointment = appointments.find((app: Appointment) => app.time === slot);
                
                if (appointment) {
                    const vinculoStyle = getVinculoStyle(appointment.vinculo);
                    const isExpanded = expandedObservationId === appointment.appointment_id;
                    return (
                        <div key={slot} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${vinculoStyle.borderColor} flex flex-col justify-between`}>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-gray-800 flex items-center gap-2"><Clock size={16} /> {slot}</p>
                                    <StatusBadge status={appointment.status} />
                                </div>
                                <div>
                                    <p className={`font-semibold truncate ${vinculoStyle.textColor}`}>{appointment.patient_name}</p>
                                    <p className="text-sm text-gray-500">{appointment.service_type}</p>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t space-y-2">
                                {appointment.observations && (
                                    <div>
                                        <button onClick={() => handleToggleObservation(appointment.appointment_id)} className="w-full flex justify-between items-center text-xs text-gray-500 hover:text-indigo-600 font-semibold">
                                            {isExpanded ? 'Ocultar Observação' : 'Ver Observação'}
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        {isExpanded && <p className="mt-2 text-sm text-gray-700 bg-gray-100 p-2 rounded-md">{appointment.observations}</p>}
                                    </div>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                    {appointment.status === 'scheduled' && (
                                        <>
                                            <button onClick={() => onMarkAsMissed(appointment)} className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold p-2 rounded hover:bg-red-50">
                                                <UserX size={14} /> Faltou
                                            </button>
                                            <button onClick={() => onCheckIn(appointment.appointment_id)} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-semibold p-2 rounded hover:bg-green-50">
                                                <UserCheck size={14} /> Check-in
                                            </button>
                                        </>
                                    )}
                                    {appointment.status === 'waiting' && (
                                        <button 
                                            onClick={() => handleStartService(appointment.appointment_id)}
                                            // A validação agora funciona corretamente.
                                            disabled={user?.profile !== 'master' && user?.user_id !== appointment.professional_id}
                                            className="w-full flex justify-center items-center gap-2 text-sm font-bold text-white bg-indigo-600 rounded-md p-2 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Stethoscope size={16} /> Atender
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={slot} className="bg-gray-50/70 p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-between transition hover:border-indigo-400 hover:bg-indigo-50">
                             <p className="font-bold text-gray-500 flex items-center gap-2"><Clock size={16} /> {slot}</p>
                             <button onClick={() => onScheduleClick(slot)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                <Plus size={16} />
                                Agendar
                             </button>
                        </div>
                    );
                }
            })}
        </div>
    );
}
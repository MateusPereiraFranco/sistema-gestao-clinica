'use client';

import { Appointment, PatientVinculo } from "@/types";
import { Clock, Plus, UserX, UserCheck, Stethoscope, ChevronDown, ChevronUp, Eye, XCircle, CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

// 1. A interface de props foi atualizada
interface AgendaTimeSlotsProps {
    appointments: Appointment[];
    isLoading: boolean;
    onCheckIn: (appointmentId: string) => void;
    onMarkAsMissed: (appointment: Appointment) => void;
    onScheduleClick: (slot: string) => void;
    onCancel: (appointmentId: string) => void;
    refreshAgenda: () => void;
    onMakeRecurring: (appointment: Appointment) => void;
    onCancelSeries: (groupId: string) => void;
    showProfessionalName?: boolean; // Nova prop para controlar a exibição do nome
}

const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
    const statusInfo: Record<Appointment['status'], { text: string; style: string }> = {
        scheduled: { text: "Agendado", style: "bg-gray-200 text-gray-800" },
        waiting: { text: "Aguardando", style: "bg-blue-100 text-blue-800 animate-pulse" },
        in_progress: { text: "Em Atendimento", style: "bg-yellow-100 text-yellow-800" },
        completed: { text: "Concluído", style: "bg-green-100 text-green-800" },
        justified_absence: { text: "Falta Justificada", style: "bg-red-100 text-red-800" },
        unjustified_absence: { text: "Faltou", style: "bg-red-200 text-red-900 font-bold" },
        canceled: { text: "Cancelado", style: "bg-gray-300 text-gray-900" },
        on_waiting_list: { text: "Lista de Espera", style: "bg-purple-100 text-purple-800" }
    };
    const info = statusInfo[status] || statusInfo.scheduled;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${info.style}`}>{info.text}</span>;
};

const getVinculoStyle = (vinculo: PatientVinculo | null) => {
    switch (vinculo) {
        case 'saude': return { bg: 'bg-pink-50', textColor: 'text-pink-800', borderColor: 'border-pink-500' };
        case 'educação': return { bg: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-500' };
        case 'AMA': return { bg: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-500' };
        default: return { bg: 'bg-indigo-50', textColor: 'text-indigo-800', borderColor: 'border-indigo-500' };
    }
}

// 2. Desestruture a nova prop
export default function AgendaTimeSlots({ appointments, isLoading, onCheckIn, onMarkAsMissed, onCancel, onScheduleClick, refreshAgenda, onMakeRecurring, onCancelSeries, showProfessionalName }: AgendaTimeSlotsProps) {
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
    
    const slotInterval = 30;
    const timeSlots = [];
    const startTime = 8 * 60;
    const endTime = 18 * 60;
    for (let time = startTime; time < endTime; time += slotInterval) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        timeSlots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }

    if (isLoading) {
        return <div className="text-center p-10 text-gray-500">A carregar agenda...</div>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeSlots.map(slot => {
                const appointment = appointments.find((app: Appointment) => app.time === slot);
                
                if (appointment) {
                    const vinculoStyle = getVinculoStyle(appointment.vinculo);
                    const canAttend = user?.user_id === appointment.professional_id;
                    const isExpanded = expandedObservationId === appointment.appointment_id;
                    
                    return (
                        <div key={slot} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${vinculoStyle.borderColor} flex flex-col justify-between min-h-[160px]`}>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-gray-800 flex items-center gap-2"><Clock size={16} /> {slot}</p>
                                    <StatusBadge status={appointment.status} />
                                </div>
                                <div>
                                    <p className={`font-semibold truncate ${vinculoStyle.textColor}`}>{appointment.patient_name}</p>
                                    <p className="text-sm text-gray-500">{appointment.service_type}</p>
                                    {/* 3. Adicione a exibição condicional do nome do profissional */}
                                    {showProfessionalName && (
                                        <p className="text-xs text-gray-400 mt-1 truncate" title={appointment.professional_name}>
                                            {appointment.professional_name}
                                        </p>
                                    )}
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
                                
                                <div className="flex justify-end items-center gap-2 flex-wrap">
                                    {appointment.status === 'scheduled' && (
                                        <>
                                            {!appointment.recurring_group_id && (
                                                <button onClick={() => onMakeRecurring(appointment)} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-2 rounded hover:bg-indigo-50" title="Repetir este agendamento semanalmente">
                                                    <CalendarClock size={14} /> Repetir
                                                </button>
                                            )}
                                            <button onClick={() => onMarkAsMissed(appointment)} className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold p-2 rounded hover:bg-red-50">
                                                <UserX size={14} /> Faltou
                                            </button>
                                            <button onClick={() => onCheckIn(appointment.appointment_id)} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-semibold p-2 rounded hover:bg-green-50">
                                                <UserCheck size={14} /> Check-in
                                            </button>
                                        </>
                                    )}
                                    
                                    {(appointment.status === 'waiting' || appointment.status === 'in_progress') && (
                                        <button 
                                            onClick={() => canAttend && handleStartService(appointment.appointment_id)}
                                            disabled={!canAttend}
                                            className="w-full flex justify-center items-center gap-2 text-sm font-bold text-white bg-indigo-600 rounded-md p-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed enabled:hover:bg-indigo-700"
                                        >
                                            <Stethoscope size={16} />
                                            {appointment.status === 'in_progress' ? 'Continuar Atend.' : 'Atender'}
                                        </button>
                                    )}
                                    
                                    {appointment.status === 'completed' && (
                                        <Link href={`/dashboard/atendimento/${appointment.appointment_id}/visualizar`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold p-2 rounded hover:bg-gray-100">
                                            <Eye size={14} /> Ver Ficha
                                        </Link>
                                    )}

                                    {(appointment.status === 'scheduled' || appointment.status === 'on_waiting_list') && (user?.profile === 'master' || user?.profile === 'admin') && (
                                        <>
                                            <button onClick={() => onCancel(appointment.appointment_id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-700 font-semibold p-2 rounded hover:bg-red-50" title="Cancelar apenas este agendamento">
                                                <XCircle size={14} /> Cancelar
                                            </button>

                                            {appointment.recurring_group_id && (
                                                <button onClick={() => onCancelSeries(appointment.recurring_group_id!)} className="flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 font-semibold p-2 rounded hover:bg-red-100" title="Cancelar todos os agendamentos futuros desta série">
                                                    <Trash2 size={14} /> Cancelar Série
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={slot} className="bg-gray-50/70 p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-between transition hover:border-indigo-400 hover:bg-indigo-50 min-h-[160px]">
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

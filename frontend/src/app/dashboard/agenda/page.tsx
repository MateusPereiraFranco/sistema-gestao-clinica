'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import { Appointment, User } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import AgendaFilters from "@/components/agenda/AgendaFilters";
import AgendaTimeSlots from "@/components/agenda/AgendaTimeSlots";
import NewAppointmentModal from "@/components/agenda/NewAppointmentModal";
import MissedAppointmentModal from "@/components/agenda/MissedAppointmentModal";
import toast from "react-hot-toast";
import { useFilterStore } from "@/stores/useFilterStore";

export default function AgendaPage() {
    const { user } = useAuthStore();
    const { agendaProfessional, setAgendaProfessional, agendaDate, includeInactive } = useFilterStore();
    
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingProfessionals, setIsFetchingProfessionals] = useState(true);

    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
    const [appointmentForModal, setAppointmentForModal] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState('');

    const fetchAgendaData = useCallback(async () => {
        if (isFetchingProfessionals || !agendaProfessional) return;
        setIsLoading(true);
        try {
            const response = await api.get('/appointments', { 
                params: { professionalId: agendaProfessional, date: agendaDate, includeInactive: includeInactive } 
            });
            setAppointments(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar a agenda.");
        } finally {
            setIsLoading(false);
        }
    }, [agendaProfessional, agendaDate, isFetchingProfessionals, includeInactive]);

    useEffect(() => {
        const fetchProfessionalsAndSetDefaults = async () => {
            if (!user) return;
            setIsFetchingProfessionals(true);
            try {
                const response = await api.get('/users', {params: {is_active: !includeInactive}});
                const professionalList: User[] = response.data.filter((u: User) => u.has_agenda === true);
                setProfessionals(professionalList);
                
                const currentProfessional = useFilterStore.getState().agendaProfessional;
                if (!currentProfessional || !professionalList.some(p => p.user_id === currentProfessional)) {
                    if (user.has_agenda === true && professionalList.some(p => p.user_id === user.user_id)) {
                        setAgendaProfessional(user.user_id);
                    } else if (professionalList.length > 0) {
                        setAgendaProfessional(professionalList[0].user_id);
                    }
                }
            } catch (error) { 
                console.error("Erro ao buscar profissionais:", error); 
            } finally {
                setIsFetchingProfessionals(false);
            }
        };
        fetchProfessionalsAndSetDefaults();
    }, [user, setAgendaProfessional, includeInactive]);

    useEffect(() => {
        fetchAgendaData();
    }, [fetchAgendaData]);
    
    const handleCheckIn = async (appointmentId: string) => {
        const toastId = toast.loading("A fazer check-in...");
        try {
            await api.patch(`/appointments/${appointmentId}/check-in`);
            toast.success("Check-in realizado!", { id: toastId });
            fetchAgendaData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha no check-in.", { id: toastId });
        }
    };
    
    const handleOpenMissedModal = (appointment: Appointment) => {
        setAppointmentForModal(appointment);
        setIsMissedModalOpen(true);
    };

    const handleCloseMissedModal = () => {
        setIsMissedModalOpen(false);
        setTimeout(() => setAppointmentForModal(null), 300);
    }

    const handleOpenNewAppointmentModal = (slot: string) => {
        setSelectedSlot(slot);
        setIsNewAppointmentModalOpen(true);
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        if (window.confirm("Tem a certeza que deseja cancelar este agendamento?")) {
            const toastId = toast.loading("A cancelar agendamento...");
            try {
                await api.patch(`/appointments/${appointmentId}/cancel`);
                toast.success("Agendamento cancelado.", { id: toastId });
                fetchAgendaData(); // Recarrega a agenda para mostrar o novo status
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Falha ao cancelar.", { id: toastId });
            }
        }
    };

    return (
        <>
            <Header title="Agenda do Dia" />
            <main className="flex-1 overflow-y-auto p-6">
                 <AgendaFilters 
                    professionals={professionals}
                />
               
                <AgendaTimeSlots 
                    appointments={appointments}
                    isLoading={isLoading}
                    onCheckIn={handleCheckIn}
                    onMarkAsMissed={handleOpenMissedModal}
                    onCancel={handleCancelAppointment}
                    onScheduleClick={handleOpenNewAppointmentModal}
                    refreshAgenda={fetchAgendaData}
                />
            </main>
            <NewAppointmentModal 
                isOpen={isNewAppointmentModalOpen}
                onClose={() => setIsNewAppointmentModalOpen(false)}
                onAppointmentCreated={fetchAgendaData}
                slot={selectedSlot}
                date={agendaDate}
                professionalId={agendaProfessional}
            />
            <MissedAppointmentModal 
                isOpen={isMissedModalOpen}
                appointment={appointmentForModal}
                onClose={handleCloseMissedModal}
                onUpdate={fetchAgendaData}
            />
        </>
    );
}
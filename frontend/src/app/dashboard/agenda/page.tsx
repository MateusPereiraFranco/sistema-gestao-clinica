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
import RecurringAppointmentModal from "@/components/agenda/RecurringAppointmentModal";

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

    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [appointmentToMakeRecurring, setAppointmentToMakeRecurring] = useState<Appointment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleCreateAppointment = async (appointmentData: any) => {
        setIsSubmitting(true);
        const toastId = toast.loading("A agendar...");
        try {
            const { waitlistEntryId, ...data } = appointmentData;
            if (waitlistEntryId) {
                await api.patch(`/appointments/${waitlistEntryId}/schedule-from-waitlist`, { newDateTime: data.appointment_datetime });
            } else {
                await api.post('/appointments', data);
            }
            toast.success("Agendamento criado com sucesso!", { id: toastId });
            setIsNewAppointmentModalOpen(false);
            fetchAgendaData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao criar agendamento.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleOpenRecurringModal = (appointment: Appointment) => {
        setAppointmentToMakeRecurring(appointment);
        setIsRecurringModalOpen(true);
    };

    // FUNÇÃO COMPLETA ADICIONADA
    const handleConfirmRecurring = async (durationInMonths: number) => {
        if (!appointmentToMakeRecurring) return;
        setIsSubmitting(true);
        try {
            await api.post('/appointments/recurring', {
                appointmentData: appointmentToMakeRecurring,
                durationInMonths: durationInMonths,
            });
            toast.success("Agendamentos recorrentes criados com sucesso!");
            setIsRecurringModalOpen(false);
            setAppointmentToMakeRecurring(null);
            fetchAgendaData();
        } catch (error) {
            toast.error("Falha ao criar agendamentos recorrentes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // FUNÇÃO COMPLETA ADICIONADA
    const handleCancelSeries = async (groupId: string) => {
        if (window.confirm("Tem a certeza que deseja apagar todos os agendamentos futuros desta série?")) {
            setIsSubmitting(true);
            try {
                await api.delete(`/appointments/recurring/${groupId}`);
                toast.success("Série de agendamentos cancelada.");
                fetchAgendaData();
            } catch (error) {
                toast.error("Falha ao cancelar a série.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
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
                fetchAgendaData();
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
                     onMakeRecurring={handleOpenRecurringModal}
                     onCancelSeries={handleCancelSeries}
                 />
            </main>
            <NewAppointmentModal 
                isOpen={isNewAppointmentModalOpen}
                onClose={() => setIsNewAppointmentModalOpen(false)}
                onConfirm={handleCreateAppointment}
                slot={selectedSlot}
                date={agendaDate}
                professionalId={agendaProfessional}
                isSubmitting={isSubmitting}
            />
            <MissedAppointmentModal 
                isOpen={isMissedModalOpen}
                appointment={appointmentForModal}
                onClose={handleCloseMissedModal}
                onUpdate={fetchAgendaData}
            />
            <RecurringAppointmentModal
              isOpen={isRecurringModalOpen}
              onClose={() => {
                setIsRecurringModalOpen(false);
                setAppointmentToMakeRecurring(null);
              }}
              onConfirm={handleConfirmRecurring}
              isLoading={isSubmitting}
            />
        </>
    );
}

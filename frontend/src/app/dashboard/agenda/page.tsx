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

export default function AgendaPage() {
    const { user } = useAuthStore();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedProfessional, setSelectedProfessional] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Controlo dos modais
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
    const [appointmentForModal, setAppointmentForModal] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState('');

    const fetchAppointments = useCallback(async () => {
        if (!selectedProfessional || !selectedDate) return;
        setIsLoading(true);
        try {
            const response = await api.get('/appointments', {
                params: { professionalId: selectedProfessional, date: selectedDate }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
            setAppointments([]);
            toast.error("Não foi possível carregar a agenda.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedProfessional, selectedDate]);

    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                const response = await api.get('/users');
                setProfessionals(response.data);
                if (user?.profile === 'normal' && response.data.some((p: User) => p.user_id === user.user_id)) {
                    setSelectedProfessional(user.user_id);
                } else if (response.data.length > 0) {
                    setSelectedProfessional(response.data[0].user_id);
                }
            } catch (error) {
                console.error("Erro ao buscar profissionais:", error);
            }
        };
        fetchProfessionals();
    }, [user]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCheckIn = async (appointmentId: string) => {
        const toastId = toast.loading("A fazer check-in...");
        try {
            await api.patch(`/appointments/${appointmentId}/check-in`);
            toast.success("Check-in realizado!", { id: toastId });
            fetchAppointments();
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
        // Pequeno atraso para a animação de saída do modal
        setTimeout(() => setAppointmentForModal(null), 300);
    }

    const handleOpenNewAppointmentModal = (slot: string) => {
        setSelectedSlot(slot);
        setIsNewAppointmentModalOpen(true);
    };

    return (
        <>
            <Header title="Agenda do Dia" />
            <main className="flex-1 overflow-y-auto p-6">
                <AgendaFilters 
                    professionals={professionals}
                    selectedProfessional={selectedProfessional}
                    setSelectedProfessional={setSelectedProfessional}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
                <AgendaTimeSlots 
                    appointments={appointments}
                    isLoading={isLoading}
                    onCheckIn={handleCheckIn}
                    onMarkAsMissed={handleOpenMissedModal}
                    onScheduleClick={handleOpenNewAppointmentModal}
                    refreshAgenda={fetchAppointments}
                />
            </main>
            <NewAppointmentModal 
                isOpen={isNewAppointmentModalOpen}
                onClose={() => setIsNewAppointmentModalOpen(false)}
                onAppointmentCreated={fetchAppointments}
                slot={selectedSlot}
                date={selectedDate}
                professionalId={selectedProfessional}
            />
            <MissedAppointmentModal 
                isOpen={isMissedModalOpen}
                appointment={appointmentForModal}
                onClose={handleCloseMissedModal}
                onUpdate={fetchAppointments}
            />
        </>
    );
}
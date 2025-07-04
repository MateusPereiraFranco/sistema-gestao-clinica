'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import { Appointment, User } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import WaitingQueue from "@/components/dashboard/WaitingQueue";
import toast from "react-hot-toast";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import { useFilterStore } from "@/stores/useFilterStore";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { dashboardProfessional, setDashboardProfessional, dashboardPeriod, dashboardDate } = useFilterStore();
    
    const [queue, setQueue] = useState<Appointment[]>([]);
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWaitingQueue = useCallback(async () => {
        if (!dashboardProfessional) return;
        setIsLoading(true);
        try {
            const params: any = { 
                date: dashboardDate,
                status: ['waiting', 'in_progress', 'completed', 'canceled'],
            };
            if (dashboardProfessional !== 'all') {
                params.professionalId = dashboardProfessional;
            }
            if (dashboardPeriod !== 'todos') {
                params.period = dashboardPeriod;
            }

            const response = await api.get('/appointments', { params });
            setQueue(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar a fila de atendimento.");
        } finally {
            setIsLoading(false);
        }
    }, [dashboardProfessional, dashboardPeriod, dashboardDate]);
    
    useEffect(() => {
        const fetchProfessionals = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users');
                const professionalList: User[] = response.data.filter((u: User) => u.profile === 'normal');
                setProfessionals(professionalList);
                
                if (user.profile === 'normal') {
                    setDashboardProfessional(user.user_id);
                }
            } catch (error) { console.error(error); }
        };
        fetchProfessionals();
    }, [user, setDashboardProfessional]);

    useEffect(() => {
        fetchWaitingQueue();
    }, [fetchWaitingQueue]);

    const handleCancelAppointment = async (appointmentId: string) => {
        if (window.confirm("Tem a certeza que deseja cancelar este atendimento?")) {
            const toastId = toast.loading("A cancelar...");
            try {
                await api.patch(`/appointments/${appointmentId}/cancel`);
                toast.success("Atendimento cancelado.", { id: toastId });
                fetchWaitingQueue(); // Atualiza a lista para refletir a mudança
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Falha ao cancelar.", { id: toastId });
            }
        }
    };

    return (
        <>
            <Header title="Fila de Atendimento do Dia" />
            <main className="flex-1 overflow-y-auto p-6">
                <DashboardFilters 
                    professionals={professionals}
                />
                <WaitingQueue 
                    queue={queue} 
                    isLoading={isLoading}
                    showProfessionalName={dashboardProfessional === 'all'}
                    onCancel={handleCancelAppointment}
                />
            </main>
        </>
    );
}
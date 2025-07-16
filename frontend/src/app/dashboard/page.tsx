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
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { dashboardProfessional, setDashboardProfessional, dashboardPeriod, dashboardDate, includeInactive } = useFilterStore();
    const router = useRouter();

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
            params.includeInactive = includeInactive;

            const response = await api.get('/appointments', { params });
            setQueue(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar a fila de atendimento.");
        } finally {
            setIsLoading(false);
        }
    }, [dashboardProfessional, dashboardPeriod, dashboardDate, includeInactive]);

    const handleStartService = async (appointmentId: string) => {
        const toastId = toast.loading("A iniciar atendimento...");
        try {
            await api.patch(`/appointments/${appointmentId}/start-service`);
            toast.success("Atendimento iniciado.", { id: toastId });
            // Não precisa de chamar fetchWaitingQueue() aqui, pois o redirecionamento
            // irá fazer com que a página seja recarregada de qualquer forma.
            router.push(`/dashboard/atendimento/${appointmentId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Não foi possível iniciar o atendimento.", { id: toastId });
        }
    };
    
    useEffect(() => {
        const fetchProfessionals = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users', {params: {is_active: !includeInactive}});
                const professionalList: User[] = response.data.filter((u: User) => u.has_agenda === true);
                setProfessionals(professionalList);
                
                if (user.profile === 'normal') {
                    setDashboardProfessional(user.user_id);
                }
            } catch (error) { console.error(error); }
        };
        fetchProfessionals();
    }, [user, setDashboardProfessional, includeInactive]);

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
                    onStartService={handleStartService}
                />
            </main>
        </>
    );
}
'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import { Appointment, User } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import WaitingQueue from "@/components/dashboard/WaitingQueue";
import toast from "react-hot-toast";
import DashboardFilters from "@/components/dashboard/DashboardFilters";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [queue, setQueue] = useState<Appointment[]>([]);
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);
    const [isFetchingProfessionals, setIsFetchingProfessionals] = useState(true);
    
    const [selectedProfessional, setSelectedProfessional] = useState<string>('');

    const fetchWaitingQueue = useCallback(async () => {
        if (!selectedProfessional) return;

        setIsLoadingQueue(true);
        try {
            const params: { date: string; status: string[]; professionalId?: string } = { 
                date: new Date().toISOString().split('T')[0],
                status: ['waiting', 'in_progress'],
            };
            if (selectedProfessional !== 'all') {
                params.professionalId = selectedProfessional;
            }

            const response = await api.get('/appointments', { params });
            setQueue(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar a fila de atendimento.");
            setQueue([]);
        } finally {
            setIsLoadingQueue(false);
        }
    }, [selectedProfessional]);
    
    useEffect(() => {
        const fetchProfessionals = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users');
                const professionalList: User[] = response.data.filter((u: User) => u.profile === 'normal');
                setProfessionals(professionalList);
                
                if (!selectedProfessional) { // Define o padrão apenas na primeira carga
                    if (user.profile === 'normal' && professionalList.some(p => p.user_id === user.user_id)) {
                        setSelectedProfessional(user.user_id);
                    } else {
                        setSelectedProfessional('all');
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar profissionais:", error);
            } finally {
                setIsFetchingProfessionals(false);
            }
        };
        fetchProfessionals();
    }, [user, selectedProfessional]);

    useEffect(() => {
        if (!isFetchingProfessionals) {
            fetchWaitingQueue();
        }
    }, [fetchWaitingQueue, isFetchingProfessionals]);

    return (
        <>
            <Header title="Fila de Atendimento do Dia" />
            <main className="flex-1 overflow-y-auto p-6">
                 {!isFetchingProfessionals && (
                     <DashboardFilters 
                        professionals={professionals}
                        selectedProfessional={selectedProfessional}
                        setSelectedProfessional={setSelectedProfessional}
                    />
                )}
               
                <WaitingQueue 
                    queue={queue} 
                    isLoading={isLoadingQueue}
                    showProfessionalName={selectedProfessional === 'all'}
                />
            </main>
        </>
    );
}
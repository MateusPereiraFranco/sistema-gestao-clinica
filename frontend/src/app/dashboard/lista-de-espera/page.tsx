'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import { Appointment, Patient, User } from "@/types";
import toast from "react-hot-toast";
import AddPatientToList from "@/components/lista-de-espera/AddPatientToList";
import WaitingListTable from "@/components/lista-de-espera/WaitingListTable";
import AddToWaitingListModal from "@/components/lista-de-espera/AddToWaitingListModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFilterStore } from "@/stores/useFilterStore";
import WaitingListFilters from "@/components/lista-de-espera/WaitingListFilters";

export default function WaitingListPage() {
    const { user } = useAuthStore();
    const { waitingListProfessional, setWaitingListProfessional, waitingListStartDate, waitingListEndDate } = useFilterStore();

    const [waitingList, setWaitingList] = useState<Appointment[]>([]);
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const fetchWaitingList = useCallback(async () => {
        
        if (!waitingListProfessional) return;
        setIsLoading(true);
        try {
            const params: any = { 
                status: ['on_waiting_list'],
                startDate: waitingListStartDate,
                endDate: waitingListEndDate,
            };
            if (waitingListProfessional !== 'all') {
                params.professionalId = waitingListProfessional;
            }
            const response = await api.get('/appointments', { params });
            setWaitingList(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar a lista de espera.");
        } finally {
            setIsLoading(false);
        }
    }, [waitingListProfessional, waitingListStartDate, waitingListEndDate]);
    
    useEffect(() => {
        const fetchProfessionals = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users');
                const profList = response.data.filter((u: User) => u.profile === 'normal');
                setProfessionals(profList);
                
                if (user.profile === 'normal') {
                    setWaitingListProfessional(user.user_id);
                }
            } catch (error) {
                console.error("Erro ao buscar profissionais:", error);
            }
        };
        fetchProfessionals();
    }, [user, setWaitingListProfessional]);

    useEffect(() => {
        fetchWaitingList();
    }, [fetchWaitingList]);

    return (
        <>
            <Header title="Lista de Espera" />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <AddPatientToList onPatientSelect={setSelectedPatient} />
                <WaitingListFilters professionals={professionals} onSearch={fetchWaitingList} isLoading={isLoading} />
                <WaitingListTable list={waitingList} isLoading={isLoading} refreshList={fetchWaitingList} />
            </main>
            <AddToWaitingListModal 
                patient={selectedPatient}
                onClose={() => setSelectedPatient(null)}
                onPatientAdded={fetchWaitingList}
            />
        </>
    );
}
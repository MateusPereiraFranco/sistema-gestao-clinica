'use client';

import Header from "@/components/layout/Header";
import PatientFilters from "@/components/patients/PatientFilters";
import PatientTable from "@/components/patients/PatientTable";
import api from "@/services/api";
import { Patient } from "@/types";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import LaunchServiceModal from "@/components/patients/LaunchServiceModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PacientesPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const handleSearch = useCallback(async (filters: Record<string, string>) => {
        setIsLoading(true);
        try {
            const response = await api.get('/patients', { params: filters });
            setPatients(response.data);
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            toast.error("Falha ao buscar pacientes.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeletePatient = async (patientId: string) => {
        if (window.confirm("Tem a certeza que deseja apagar este paciente? Esta ação não pode ser revertida.")) {
            const toastId = toast.loading("A apagar paciente...");
            try {
                await api.delete(`/patients/${patientId}`);
                toast.success("Paciente apagado com sucesso.", { id: toastId });
                setPatients(prev => prev.filter(p => p.patient_id !== patientId));
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Falha ao apagar paciente.", { id: toastId });
            }
        }
    };

    const handleOpenLaunchModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsLaunchModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsLaunchModalOpen(false);
        setTimeout(() => setSelectedPatient(null), 300);
    }
    
    const headerAction = (
        <Link href="/dashboard/pacientes/novo"
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            <PlusCircle size={20} />
            Adicionar Paciente
        </Link>
    );

    return (
        <>
            <Header title="Gestão de Pacientes" action={headerAction} />
            <main className="flex-1 overflow-y-auto p-6">
                <PatientFilters onSearch={handleSearch} setIsLoading={setIsLoading} />
                <PatientTable 
                    patients={patients} 
                    isLoading={isLoading} 
                    onLaunchService={handleOpenLaunchModal} 
                    onDeletePatient={handleDeletePatient}
                />
            </main>
            <LaunchServiceModal
                patient={selectedPatient}
                onClose={handleCloseModal}
                onServiceLaunched={() => {
                    toast.success("Paciente encaminhado para a fila de atendimento.");
                    router.push('/dashboard');
                }}
            />
        </>
    )
}
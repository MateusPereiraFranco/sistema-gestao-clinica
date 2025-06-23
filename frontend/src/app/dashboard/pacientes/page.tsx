'use client';

import Header from "@/components/layout/Header";
import PatientFilters from "@/components/patients/PatientFilters";
import PatientTable from "@/components/patients/PatientTable";
import api from "@/services/api";
import { Patient } from "@/types";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PacientesPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (filters: Record<string, string>) => {
        setIsLoading(true);
        try {
            const response = await api.get('/patients', { params: filters });
            setPatients(response.data);
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            // Poderia adicionar um toast de erro aqui
        } finally {
            setIsLoading(false);
        }
    };
    
    // O botão de Adicionar é passado como uma "action" para o componente Header.
    const headerAction = (
        <Link 
            href="/dashboard/pacientes/novo"
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
            <PlusCircle size={20} />
            Adicionar Paciente
        </Link>
    );

    return (
        <>
            <Header title="Gestão de Pacientes" action={headerAction} />
            <main className="flex-1 overflow-y-auto p-6">
                <PatientFilters onSearch={handleSearch} setIsLoading={setIsLoading} />
                <PatientTable patients={patients} isLoading={isLoading} />
            </main>
        </>
    )
}
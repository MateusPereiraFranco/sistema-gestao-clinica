'use client';

import Header from "@/components/layout/Header";
import PatientForm from "@/components/patients/PatientForm";
import api from "@/services/api";
import { Patient } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarPacientePage() {
    const params = useParams();
    const patientId = params.patientId as string;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patientId) {
            const fetchPatient = async () => {
                try {
                    const response = await api.get(`/patients/${patientId}/for-edit`);
                    setPatient(response.data);
                } catch (err) {
                    setError("Paciente não encontrado ou erro ao carregar dados.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPatient();
        }
    }, [patientId]);
    
    if (isLoading) {
        return (
            <>
                <Header title="Editar Paciente" />
                <main className="flex-1 p-6">
                    <p>A carregar dados do paciente...</p>
                </main>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Header title="Erro" />
                <main className="flex-1 p-6">
                    <p className="text-red-500">{error}</p>
                </main>
            </>
        )
    }

    return (
        <>
            <Header title="Editar Paciente" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                    {patient && <PatientForm patient={patient} />}
                </div>
            </main>
        </>
    );
}
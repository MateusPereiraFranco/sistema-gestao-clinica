'use client';

import Header from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { ServiceDetails } from "@/types";
import PatientHeader from "@/components/atendimento/PatientHeader";
import EvolutionForm from "@/components/atendimento/EvolutionForm";

export default function AtendimentoPage() {
    const params = useParams();
    const appointmentId = params.appointmentId as string;

    const [details, setDetails] = useState<ServiceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (appointmentId) {
            const fetchDetails = async () => {
                try {
                    const response = await api.get(`/appointments/${appointmentId}/details-for-service`);
                    setDetails(response.data);
                } catch (err) {
                    setError("Não foi possível carregar os dados do atendimento.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [appointmentId]);

    if (isLoading) return <div className="p-6">A carregar...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <>
            <Header title="Ficha de Atendimento" />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {details && <PatientHeader details={details} />}
                {details && <EvolutionForm appointmentId={details.appointment_id} />}
            </main>
        </>
    );
}
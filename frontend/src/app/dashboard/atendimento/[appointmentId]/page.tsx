'use client';

import Header from "@/components/layout/Header";
import { useParams, useRouter } from "next/navigation"; // Importe o useRouter
import { useEffect, useState } from "react";
import api from "@/services/api";
import { ServiceDetails } from "@/types";
import PatientHeader from "@/components/atendimento/PatientHeader";
import EvolutionForm from "@/components/atendimento/EvolutionForm";
import toast from "react-hot-toast"; // Importe o toast

export default function AtendimentoPage() {
    const params = useParams();
    const router = useRouter();
    const appointmentId = params.appointmentId as string;

    const [details, setDetails] = useState<ServiceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [editableAppointmentDate, setEditableAppointmentDate] = useState('');

    useEffect(() => {
        if (appointmentId) {
            const fetchDetails = async () => {
                try {
                    const response = await api.get(`/appointments/${appointmentId}/details-for-service`);
                    setDetails(response.data);
                    // Inicializa a data editável com a data do agendamento
                    if (response.data.appointment_datetime) {
                        setEditableAppointmentDate(response.data.appointment_datetime);
                    }
                } catch (err) {
                    setError("Não foi possível carregar os dados do atendimento.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [appointmentId]);

    const handleFinalize = async (formData: any) => {
        const dataToSubmit = {
            ...formData,
            appointment_datetime: editableAppointmentDate,
        };

        const toastId = toast.loading("A finalizar atendimento...");
        try {
            await api.post(`/appointments/${appointmentId}/complete-service`, dataToSubmit);
            toast.success("Atendimento finalizado com sucesso!", { id: toastId });
            router.push('/dashboard'); // Redireciona para o dashboard
        } catch (error) {
            toast.error("Falha ao finalizar o atendimento.", { id: toastId });
            throw error;
        }
    };

    if (isLoading) return <div className="p-6">A carregar...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <>
            <Header title="Ficha de Atendimento" />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {details && (
                    <PatientHeader 
                        details={details} 
                        appointmentDate={editableAppointmentDate}
                        onAppointmentDateChange={setEditableAppointmentDate}
                    />
                )}
                {details && (
                    <EvolutionForm 
                        appointmentId={details.appointment_id} 
                        patientId={details.patient_id}
                        onFinalize={handleFinalize}
                    />
                )}
            </main>
        </>
    );
}

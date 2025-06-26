'use client';

import Header from "@/components/layout/Header";
import api from "@/services/api";
import { CompletedServiceDetails } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Componente para exibir os detalhes de forma limpa
const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'Não informado'}</p>
    </div>
);

export default function ViewServicePage() {
    const params = useParams();
    const appointmentId = params.appointmentId as string;
    const [details, setDetails] = useState<CompletedServiceDetails | null>(null);

    useEffect(() => {
        if (appointmentId) {
            api.get(`/appointments/${appointmentId}/view`).then(res => setDetails(res.data));
        }
    }, [appointmentId]);

    if (!details) return <div className="p-6">A carregar detalhes do atendimento...</div>;

    return (
        <>
            <Header title={`Atendimento Finalizado - ${details.patient_name}`} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <DetailItem label="Paciente" value={details.patient_name} />
                        <DetailItem label="Profissional" value={details.professional_name} />
                        <DetailItem label="Especialidade" value={details.specialty_name} />
                        <DetailItem label="Data de Nasc." value={details.patient_birth_date} />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Evolução Registada</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{details.evolution}</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Conduta Final</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium">Encaminhamentos:</p>
                            {details.referrals.length > 0 ? (
                                <ul className="list-disc list-inside mt-2">
                                    {details.referrals.map(r => <li key={r.name}>{r.name} ({r.specialty_name})</li>)}
                                </ul>
                            ) : <p>Nenhum encaminhamento foi feito.</p>}
                        </div>
                        <div>
                            <p className="font-medium">Resultado:</p>
                            {details.discharge_given ? <p className="text-green-600 font-bold">Alta Concedida</p> :
                                <p>Retorno em <span className="font-bold">{details.follow_up_days}</span> dias.</p>
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
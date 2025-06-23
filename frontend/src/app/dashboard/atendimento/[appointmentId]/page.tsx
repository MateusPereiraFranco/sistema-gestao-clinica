'use client';

import Header from "@/components/layout/Header";
import { useParams } from "next/navigation";

export default function AtendimentoPage() {
    const params = useParams();
    const { appointmentId } = params;

    return (
        <>
            <Header title="Ficha de Atendimento" />
            <main className="flex-1 overflow-y-auto p-6">
                <h2 className="text-xl">Iniciando Atendimento</h2>
                <p className="mt-2">ID do Agendamento: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{appointmentId}</span></p>
                <div className="mt-6">
                    <p className="font-semibold">TODO:</p>
                    <ul className="list-disc list-inside">
                        <li>Buscar os dados completos do agendamento e do paciente usando o ID.</li>
                        <li>Exibir o formulário de anamnese correspondente à especialidade.</li>
                        <li>Permitir o preenchimento da evolução do paciente.</li>
                        <li>Salvar o registo de atendimento na base de dados.</li>
                    </ul>
                </div>
            </main>
        </>
    );
}
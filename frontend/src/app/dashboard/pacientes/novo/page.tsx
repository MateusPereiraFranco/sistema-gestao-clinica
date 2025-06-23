'use client';

import Header from "@/components/layout/Header";
import PatientForm from "@/components/patients/PatientForm";

export default function NovoPacientePage() {
    return (
        <>
            <Header title="Novo Paciente" />
            <main className="flex-1 overflow-y-auto p-6">
                <PatientForm />
            </main>
        </>
    );
}
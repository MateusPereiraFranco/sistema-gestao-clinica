'use client';

import Header from "@/components/layout/Header";
import PatientForm from "@/components/patients/PatientForm";

export default function NovoPacientePage() {
    return (
        <>
            <Header title="Novo Paciente" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                    <PatientForm />
                </div>
            </main>
        </>
    );
}
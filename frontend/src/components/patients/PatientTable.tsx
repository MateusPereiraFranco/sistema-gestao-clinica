'use client';

import { Patient } from "@/types";
import { FileText, Pencil, Trash2, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

interface PatientTableProps {
    patients: Patient[];
    isLoading: boolean;
    onLaunchService: (patient: Patient) => void;
    onDeletePatient: (patientId: string) => void;
}

export default function PatientTable({ patients, isLoading, onLaunchService, onDeletePatient }: PatientTableProps) {
    const { user } = useAuthStore();

    if (isLoading) {
        return <div className="text-center p-8">A carregar pacientes...</div>;
    }

    if (patients.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow">Nenhum paciente encontrado.</div>
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Paciente</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Mãe</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                        <tr key={patient.patient_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-500">CPF: {patient.cpf || 'N/A'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.mother_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.birth_date_formatted}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Link href={`/dashboard/pacientes/${patient.patient_id}/prontuario`} className="inline-flex items-center text-gray-600 hover:text-gray-900" title="Ver Prontuário">
                                    <FileText className="w-5 h-5"/>
                                </Link>
                                <button onClick={() => onLaunchService(patient)} className="inline-flex items-center text-green-600 hover:text-green-900" title="Lançar Atendimento">
                                    <Stethoscope className="w-5 h-5"/>
                                </button>
                                <Link href={`/dashboard/pacientes/${patient.patient_id}/editar`} className="inline-flex items-center text-blue-600 hover:text-blue-900" title="Editar Paciente">
                                    <Pencil className="w-5 h-5"/>
                                </Link>
                                {user?.profile === 'master' || user?.profile === 'admin' && (
                                    <button onClick={() => onDeletePatient(patient.patient_id)} className="inline-flex items-center text-red-600 hover:text-red-900" title="Apagar Paciente">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
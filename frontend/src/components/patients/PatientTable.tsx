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
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

export default function PatientTable({ patients, isLoading, onLaunchService, onDeletePatient, currentPage, itemsPerPage, totalItems }: PatientTableProps) {
    const { user } = useAuthStore();

    if (isLoading) {
        return <div className="text-center p-8">A carregar pacientes...</div>;
    }

    if (patients.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow">Nenhum paciente encontrado.</div>
    }

    const firstItem = (currentPage - 1) * itemsPerPage + 1;
    const lastItem = firstItem + patients.length - 1;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 text-sm text-gray-600 border-b">
                Mostrando <span className="font-bold">{firstItem}</span> a <span className="font-bold">{lastItem}</span> de <span className="font-bold">{totalItems}</span> pacientes.
            </div>
            {/* 1. A tabela tradicional é escondida em ecrãs pequenos (hidden) e só aparece em ecrãs médios para cima (md:table) */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
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
                                {(user?.profile === 'master' || user?.profile === 'admin') && (
                                    <button onClick={() => onDeletePatient(patient.patient_id)} className="inline-flex items-center text-red-600 hover:text-red-900" title="Apagar Paciente">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 2. A visualização em "cartões" para telemóveis. É visível por defeito e escondida em ecrãs médios para cima (md:hidden) */}
            <div className="md:hidden">
                {patients.map((patient) => (
                    <div key={patient.patient_id} className="border-b p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-indigo-700">{patient.name}</p>
                                <p className="text-sm text-gray-500">CPF: {patient.cpf || 'N/A'}</p>
                            </div>
                            {/* Botões de Ação */}
                            <div className="flex items-center space-x-2 shrink-0">
                                <Link href={`/dashboard/pacientes/${patient.patient_id}/prontuario`} className="p-2 text-gray-600" title="Ver Prontuário"><FileText className="w-5 h-5"/></Link>
                                <button onClick={() => onLaunchService(patient)} className="p-2 text-green-600" title="Lançar Atendimento"><Stethoscope className="w-5 h-5"/></button>
                                <Link href={`/dashboard/pacientes/${patient.patient_id}/editar`} className="p-2 text-blue-600" title="Editar Paciente"><Pencil className="w-5 h-5"/></Link>
                                {(user?.profile === 'master' || user?.profile === 'admin') && (
                                    <button onClick={() => onDeletePatient(patient.patient_id)} className="p-2 text-red-600" title="Apagar Paciente"><Trash2 className="w-5 h-5"/></button>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                            <p><span className="font-medium">Mãe:</span> {patient.mother_name}</p>
                            <p><span className="font-medium">Nascimento:</span> {patient.birth_date_formatted}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

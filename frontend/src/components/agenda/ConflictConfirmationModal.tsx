'use client';

import { Appointment } from "@/types";
import { AlertTriangle } from "lucide-react";

interface ConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    entry: Appointment;
}

export default function ConflictConfirmationModal({ isOpen, onClose, onConfirm, entry }: ConflictModalProps) {
    if (!isOpen) return null;

    const entryDate = new Date(entry.appointment_datetime).toLocaleDateString('pt-BR');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Confirmar Agendamento</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Este paciente já está na lista de espera desde <span className="font-bold">{entryDate}</span>.
                            Ao continuar, o paciente será <span className="font-bold">agendado e removido</span> da lista de espera. Deseja prosseguir?
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 flex justify-end gap-3">
                    <button type="button" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500" onClick={onConfirm}>
                        Sim, Agendar
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';

import { User } from "@/types";
import { AlertTriangle } from "lucide-react";

interface Conflict {
    professionalId: string;
    message: string;
}

interface ReferralConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conflicts: Conflict[];
    professionals: User[];
}

export default function ReferralConflictModal({ isOpen, onClose, onConfirm, conflicts, professionals }: ReferralConflictModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Conflito de Encaminhamento</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            O paciente já está na lista de espera para o(s) seguinte(s) profissional(is):
                        </p>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                            {conflicts.map(conflict => (
                                <li key={conflict.professionalId} className="text-gray-800">
                                    <span className="font-semibold">{professionals.find(p => p.user_id === conflict.professionalId)?.name}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm text-gray-600">
                            Deseja continuar? Estes encaminhamentos serão ignorados.
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 flex justify-end gap-3">
                    <button type="button" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" onClick={onClose}>
                        Cancelar e Corrigir
                    </button>
                    <button type="button" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500" onClick={onConfirm}>
                        Sim, Continuar
                    </button>
                </div>
            </div>
        </div>
    );
}
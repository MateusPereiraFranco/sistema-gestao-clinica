'use client';

import api from '@/services/api';
import { Appointment } from '@/types';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function MissedAppointmentModal({ isOpen, appointment, onClose, onUpdate }: ModalProps) {
    const [isJustified, setIsJustified] = useState(false);
    const [observation, setObservation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (appointment) {
            setIsJustified(false);
            setObservation('');
        }
    }, [appointment]);

    if (!isOpen || !appointment) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('A atualizar status...');
        try {
            await api.patch(`/appointments/${appointment.appointment_id}/mark-as-missed`, {
                isJustified,
                observation: isJustified ? observation : null,
            });
            toast.success("Status atualizado com sucesso!", { id: toastId });
            onUpdate();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao atualizar.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Marcar Falta</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    A confirmar a falta para <span className="font-bold">{appointment.patient_name}</span> no horário das {appointment.time}.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="radio" name="absence_type" checked={!isJustified} onChange={() => setIsJustified(false)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                            <span>Não Justificada</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="radio" name="absence_type" checked={isJustified} onChange={() => setIsJustified(true)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                            <span>Justificada</span>
                        </label>
                    </div>
                    {isJustified && (
                        <div className="animate-fade-in">
                            <label htmlFor="observation" className="block text-sm font-medium text-gray-700">Motivo / Observação</label>
                            <textarea id="observation" rows={3} value={observation} onChange={(e) => setObservation(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="py-2 px-4 rounded-md bg-gray-100 font-semibold hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleConfirm} disabled={isLoading} className="py-2 px-4 rounded-md bg-red-600 text-white font-semibold disabled:bg-red-300">
                        {isLoading ? 'A confirmar...' : 'Confirmar Falta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
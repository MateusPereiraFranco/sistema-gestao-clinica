'use client';

import api from '@/services/api';
import { Patient, User, Appointment } from '@/types';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AddToWaitingListModalProps {
    patient: Patient | null;
    onClose: () => void;
    onPatientAdded: () => void;
}

export default function AddToWaitingListModal({ patient, onClose, onPatientAdded }: AddToWaitingListModalProps) {
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (patient) {
            api.get('/users').then(res => {
                const profList = res.data.filter((u: User) => u.profile === 'normal');
                setProfessionals(profList);
                if (profList.length > 0) setSelectedProfessional(profList[0].user_id);
            });
        }
    }, [patient]);

    const handleConfirm = async () => {
        if (!selectedProfessional || !patient) {
            toast.error("Selecione um paciente e um profissional.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("A verificar lista de espera...");

        try {
            // Passo 1: Verificar se já existe uma entrada.
            const checkResponse = await api.get('/appointments/check-waiting-list', {
                params: {
                    patientId: patient.patient_id,
                    professionalId: selectedProfessional,
                }
            });

            const existingEntry: Appointment | null = checkResponse.data;

            // Passo 2: Se existir, mostrar o alerta e parar.
            if (existingEntry) {
                toast.error(
                    `Este paciente já está na lista de espera para este médico desde ${existingEntry.request_date}, adicionado por ${existingEntry.created_by_name || 'desconhecido'}.`,
                    { id: toastId, duration: 6000 }
                );
                setIsLoading(false);
                return;
            }

            // Passo 3: Se não existir, criar a nova entrada.
            toast.loading("A adicionar à lista...", { id: toastId });
            await api.post('/appointments/waiting-list', {
                patient_id: patient.patient_id,
                professional_id: selectedProfessional,
                request_date: requestDate,
            });
            toast.success(`${patient.name} adicionado à lista de espera.`, { id: toastId });
            onPatientAdded();
            onClose();

        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao adicionar à lista.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (!patient) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-lg font-bold">Adicionar à Lista de Espera</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">Paciente:</p>
                        <p className="font-bold text-lg text-indigo-700">{patient.name}</p>
                    </div>
                    <div>
                        <label htmlFor="professional" className="block text-sm font-medium text-gray-700">Direcionar para</label>
                        <select id="professional" value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                            {professionals.map(p => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data da Solicitação</label>
                        <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="py-2 px-4 rounded-md bg-gray-100 font-semibold">Cancelar</button>
                    <button onClick={handleConfirm} disabled={isLoading} className="py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold disabled:bg-indigo-300">
                        {isLoading ? 'A verificar...' : 'Adicionar à Lista'}
                    </button>
                </div>
            </div>
        </div>
    );
}
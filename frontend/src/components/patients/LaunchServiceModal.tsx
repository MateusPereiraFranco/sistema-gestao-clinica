'use client';

import { useWaitingListCheck } from '@/hooks/useWaitingListCheck';
import ConflictConfirmationModal from '../agenda/ConflictConfirmationModal';
import api from '@/services/api';
import { Patient, User, PatientVinculo } from '@/types';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LaunchServiceModalProps {
    patient: Patient | null;
    onClose: () => void;
    onServiceLaunched: () => void;
}

export default function LaunchServiceModal({ patient, onClose, onServiceLaunched }: LaunchServiceModalProps) {
    const [vinculo, setVinculo] = useState<PatientVinculo>('nenhum');
    const router = useRouter();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    
    const { waitingListEntry } = useWaitingListCheck(patient?.patient_id, selectedProfessional);

    useEffect(() => {
        if (patient) {
            api.get('/users', {params: {is_active: true}}).then(res => {
                const professionalList = res.data.filter((u: User) => u.has_agenda === true);
                setProfessionals(professionalList);
                if (professionalList.length > 0) setSelectedProfessional(professionalList[0].user_id);
            });
        }
    }, [patient]);

    const generateService = async (waitlistEntryId?: string) => {
        setIsLoading(true);
        const toastId = toast.loading("A gerar atendimento...");
        try {
            if (waitlistEntryId) {
                await api.patch(`/appointments/${waitlistEntryId}/attend-from-waitlist`);
            } else {
                await api.post('/appointments/on-demand', {
                    patient_id: patient!.patient_id,
                    professional_id: selectedProfessional,
                    vinculo: vinculo,
                });
            }
            toast.success("Paciente adicionado à fila de atendimento!", { id: toastId });
            onServiceLaunched();
            onClose();
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao gerar atendimento.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = async () => {
        if (!selectedProfessional) {
            toast.error("Por favor, selecione um profissional.");
            return;
        }
        if (vinculo === 'nenhum') {
            toast.error("Por favor, selecione um vículo.");
            return;
        }
        if (waitingListEntry) {
            setShowConflictModal(true);
            return;
        }
        await generateService();
    };

    if (!patient) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h3 className="text-lg font-bold">Gerar Atendimento</h3>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Paciente:</p>
                            <p className="font-bold text-lg text-indigo-700">{patient.name}</p>
                        </div>
                        <div>
                            <label htmlFor="professional_launch" className="block text-sm font-medium text-gray-700">Direcionar para o Profissional:</label>
                            <select id="professional_launch" value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {professionals.length === 0 && <option>A carregar...</option>}
                                {professionals.map(pro => (
                                    <option key={pro.user_id} value={pro.user_id}>
                                        {pro.name} ({pro.specialty_name || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                        <label htmlFor="vinculo_lancamento" className="block text-sm font-medium text-gray-700">Vínculo do Atendimento</label>
                        <select id="vinculo_lancamento" value={vinculo} onChange={(e) => setVinculo(e.target.value as PatientVinculo)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            <option value="nenhum">Nenhum</option>
                            <option value="saude">Saúde</option>
                            <option value="educação">Educação</option>
                            <option value="AMA">AMA</option>
                        </select>
                    </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <button onClick={onClose} className="py-2 px-4 rounded-md bg-gray-100 font-semibold hover:bg-gray-200">Cancelar</button>
                        <button onClick={handleConfirm} disabled={isLoading || !selectedProfessional} className="py-2 px-4 rounded-md bg-green-600 text-white font-semibold disabled:bg-green-300">
                            {isLoading ? 'A gerar...' : 'Gerar Atendimento'}
                        </button>
                    </div>
                </div>
            </div>

            <ConflictConfirmationModal
                isOpen={showConflictModal}
                onClose={() => setShowConflictModal(false)}
                entry={waitingListEntry!}
                onConfirm={() => {
                    setShowConflictModal(false);
                    generateService(waitingListEntry!.appointment_id);
                }}
            />
        </>
    );
}
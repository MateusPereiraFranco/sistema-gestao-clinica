'use client';

import { User, Appointment } from '@/types';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import ReferralConflictModal from './ReferralConflictModal';
import { useAuthStore } from '@/stores/useAuthStore';

interface EvolutionFormProps {
    appointmentId: string;
    patientId: string;
    onFinalize: (formData: any) => Promise<void>; // Prop para comunicar com a página pai
}

interface Conflict {
    professionalId: string;
    message: string;
}

export default function EvolutionForm({ appointmentId, patientId, onFinalize }: EvolutionFormProps) {
    const router = useRouter();
    const { user: loggedInUser } = useAuthStore();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [evolutionText, setEvolutionText] = useState('');
    const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
    const [referralConflicts, setReferralConflicts] = useState<Conflict[]>([]);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [isDischarged, setIsDischarged] = useState(false);
    const [followUpDays, setFollowUpDays] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/users', { params: { has_agenda: true, is_active: true } }).then(res => {
            const filteredProfessionals = res.data.filter((pro: User) => pro.user_id !== loggedInUser?.user_id);
            setProfessionals(filteredProfessionals);
        });
    }, [loggedInUser]);

    const checkForConflict = async (professionalId: string) => {
        try {
            const response = await api.get('/appointments/check-waiting-list', {
                params: { patientId, professionalId }
            });
            const existingEntry: Appointment | null = response.data;

            if (existingEntry) {
                const entryDate = new Date(existingEntry.appointment_datetime).toLocaleDateString('pt-BR');
                const message = `Já na lista de espera desde ${entryDate}.`;
                setReferralConflicts(prev => [...prev, { professionalId, message }]);
            }
        } catch (error) {
            console.error("Erro ao verificar lista de espera:", error);
        }
    };

    const handleReferralToggle = (id: string) => {
        const isSelected = selectedReferrals.includes(id);
        if (isSelected) {
            setSelectedReferrals(prev => prev.filter(pId => pId !== id));
            setReferralConflicts(prev => prev.filter(c => c.professionalId !== id));
        } else {
            setSelectedReferrals(prev => [...prev, id]);
            checkForConflict(id);
        }
    };

    const handleDischargeToggle = () => {
        setIsDischarged(!isDischarged);
        if (!isDischarged) setFollowUpDays('');
    };
    
    const submitForm = async () => {
        setIsLoading(true);
        
        const validReferrals = selectedReferrals.filter(
            refId => !referralConflicts.some(c => c.professionalId === refId)
        );

        const formData = {
            evolution: evolutionText,
            referral_ids: validReferrals,
            discharge_given: isDischarged,
            follow_up_days: isDischarged ? null : (followUpDays ? parseInt(followUpDays) : null),
        };

        try {
            await onFinalize(formData);
        } catch (error) {
            console.error("Erro ao finalizar (EvolutionForm):", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (referralConflicts.length > 0) {
            setShowConflictModal(true);
        } else {
            submitForm();
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md space-y-8">
                <div>
                    <label htmlFor="evolution" className="block text-lg font-semibold text-gray-800">Evolução do Paciente</label>
                    <textarea id="evolution" rows={10} value={evolutionText} onChange={e => setEvolutionText(e.target.value)}
                        className="mt-2 w-full p-3 border rounded-md" placeholder="Descreva aqui a evolução, procedimentos e observações da consulta..."/>
                </div>

                <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-800">Encaminhamentos</h3>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {professionals.map(pro => {
                            const isSelected = selectedReferrals.includes(pro.user_id);
                            const conflict = referralConflicts.find(c => c.professionalId === pro.user_id);
                            return (
                                <div key={pro.user_id}>
                                    <button type="button" onClick={() => handleReferralToggle(pro.user_id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelected ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                        {pro.specialty_name || 'Clínico'}
                                        { pro.name && <span className="ml-2">({pro.name})</span> }
                                    </button>
                                    {conflict && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-700 animate-fade-in">
                                            <AlertCircle size={14} />
                                            <span>{conflict.message}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-800">Conduta Final</h3>
                    {/* A secção de conduta agora empilha em telemóveis e alinha-se em ecrãs maiores */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-4">
                        <div className="flex items-center gap-4">
                            <label className="font-medium shrink-0">Retorno em:</label>
                            <input type="number" value={followUpDays} onChange={e => setFollowUpDays(e.target.value)}
                                disabled={isDischarged} placeholder="dias"
                                className="w-24 p-2 border rounded-md disabled:bg-gray-200"/>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="discharge" checked={isDischarged} onChange={handleDischargeToggle} className="h-5 w-5 rounded text-indigo-600"/>
                            <label htmlFor="discharge" className="ml-3 block text-md font-medium text-gray-900">Conceder Alta</label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t">
                    <button type="button" onClick={handleSubmit} disabled={isLoading}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 w-full sm:w-auto">
                        {isLoading ? 'A finalizar...' : 'Finalizar Atendimento'}
                    </button>
                </div>
            </div>

            <ReferralConflictModal
                isOpen={showConflictModal}
                onClose={() => setShowConflictModal(false)}
                onConfirm={() => {
                    setShowConflictModal(false);
                    submitForm();
                }}
                conflicts={referralConflicts}
                professionals={professionals}
            />
        </>
    );
}

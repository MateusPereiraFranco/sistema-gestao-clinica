'use client';
import { User } from '@/types';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface EvolutionFormProps {
    appointmentId: string;
}

export default function EvolutionForm({ appointmentId }: EvolutionFormProps) {
    const router = useRouter();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [evolutionText, setEvolutionText] = useState('');
    const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
    const [isDischarged, setIsDischarged] = useState(false);
    const [followUpDays, setFollowUpDays] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/users', { params: { profile: 'normal' } }).then(res => setProfessionals(res.data));
    }, []);

    const handleReferralToggle = (id: string) => {
        setSelectedReferrals(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleDischargeToggle = () => {
        setIsDischarged(!isDischarged);
        if (!isDischarged) setFollowUpDays(''); // Limpa o retorno se der alta
    };
    
    const handleSubmit = async () => {
        setIsLoading(true);
        const toastId = toast.loading("A finalizar atendimento...");
        try {
            await api.post(`/appointments/${appointmentId}/complete-service`, {
                evolution: evolutionText,
                referral_ids: selectedReferrals,
                discharge_given: isDischarged,
                follow_up_days: isDischarged ? null : (followUpDays ? parseInt(followUpDays) : null),
            });
            toast.success("Atendimento finalizado com sucesso!", { id: toastId });
            router.push('/dashboard/agenda');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Falha ao finalizar.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
            {/* ... (Evolução, Encaminhamentos, Conduta Final) ... */}
            <div>
                <label htmlFor="evolution" className="block text-lg font-semibold text-gray-800">Evolução do Paciente</label>
                <textarea id="evolution" rows={10} value={evolutionText} onChange={e => setEvolutionText(e.target.value)}
                    className="mt-2 w-full p-3 border rounded-md" placeholder="Descreva aqui a evolução, procedimentos e observações da consulta..."/>
            </div>

            <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-800">Encaminhamentos</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                    {professionals.map(pro => (
                        <button key={pro.user_id} type="button" onClick={() => handleReferralToggle(pro.user_id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedReferrals.includes(pro.user_id) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            {pro.specialty_name || 'Clínico'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-800">Conduta Final</h3>
                <div className="flex flex-col sm:flex-row gap-8 mt-4">
                    <div className="flex items-center gap-4">
                        <label className="font-medium">Retorno em:</label>
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
                <button onClick={handleSubmit} disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300">
                    Finalizar Atendimento
                </button>
            </div>
        </div>
    );
}
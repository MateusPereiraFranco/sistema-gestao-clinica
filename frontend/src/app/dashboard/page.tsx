'use client';

import Header from '@/components/layout/Header';
import api from '@/services/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Stethoscope, User, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

// Tipagem para os dados da agenda que vêm da API
interface AgendaItem {
    appointment_id: string;
    appointment_datetime: string;
    service_type: string;
    status: string;
    patient_id: string;
    patient_name: string;
    photo_url: string | null;
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [agenda, setAgenda] = useState<AgendaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgenda = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/appointments/my-agenda');
                setAgenda(response.data);
                setError(null);
            } catch (err) {
                console.error("Erro ao buscar agenda:", err);
                setError("Não foi possível carregar a agenda. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAgenda();
    }, []);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Header title="Meu Dashboard" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Olá, {user?.name.split(' ')[0]}!</h2>
                    <p className="text-gray-600">Aqui está a sua agenda de atendimentos para hoje.</p>
                </div>
                
                {isLoading && <p>A carregar agenda...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!isLoading && !error && (
                    <div className="space-y-4">
                        {agenda.length > 0 ? (
                            agenda.map(item => (
                                <div key={item.appointment_id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between transition hover:shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-3 rounded-full">
                                            <Stethoscope className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900">{item.patient_name}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1.5"><Clock size={14} /> {formatTime(item.appointment_datetime)}</span>
                                                <span className="flex items-center gap-1.5"><User size={14} /> {item.service_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/dashboard/atendimento/${item.appointment_id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                                    >
                                        Atender
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-700">Nenhum agendamento para hoje!</h3>
                                <p className="text-gray-500 mt-2">Aproveite para organizar as suas tarefas ou tomar um café.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}
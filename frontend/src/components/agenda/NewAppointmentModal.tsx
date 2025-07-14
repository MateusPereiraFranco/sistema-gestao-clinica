'use client';

import { useEffect, useState } from 'react';
import { useWaitingListCheck } from '@/hooks/useWaitingListCheck';
import ConflictConfirmationModal from './ConflictConfirmationModal';
import { useFutureScheduleCheck } from '@/hooks/useFutureScheduleCheck';
import FutureScheduleConflictModal from './FutureScheduleConflictModal';
import api from '@/services/api';
import { Patient, PatientVinculo } from '@/types';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF } from '@/utils/masks';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated: () => void;
    slot: string;
    date: string;
    professionalId: string;
}

export default function NewAppointmentModal({ isOpen, onClose, onAppointmentCreated, slot, date, professionalId }: ModalProps) {
    const [vinculo, setVinculo] = useState<PatientVinculo>('nenhum');
    const [searchFilters, setSearchFilters] = useState({ name: '', cpf: '', birth_date: '' });
    const [suggestions, setSuggestions] = useState<Patient[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showFutureScheduleConflictModal, setShowFutureScheduleConflictModal] = useState(false);
    
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [observations, setObservations] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    
    const { waitingListEntry } = useWaitingListCheck(selectedPatient?.patient_id, professionalId);
    const { futureAppointment } = useFutureScheduleCheck(selectedPatient?.patient_id);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({ ...prev, [name]: name === 'cpf' ? maskCPF(value) : value }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeFilters = Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v));
        if (Object.keys(activeFilters).length === 0) {
            toast.error("Preencha pelo menos um campo para buscar.");
            return;
        }
        
        setIsSearching(true);
        setHasSearched(true);
        try {
            const response = await api.get('/patients', { params: activeFilters });
            setSuggestions(response.data);
        } catch (error) {
            toast.error("Erro ao buscar pacientes.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setSuggestions([]);
    };

    const createNewAppointment = async (waitlistEntryId?: string) => {
        setIsLoading(true);
        const toastId = toast.loading("A agendar...");
        try {
            const appointment_datetime = `${date}T${slot}:00`;
            if (waitlistEntryId) {
                await api.patch(`/appointments/${waitlistEntryId}/schedule-from-waitlist`, { newDateTime: appointment_datetime });
            } else {
                await api.post('/appointments', {
                    patient_id: selectedPatient!.patient_id,
                    professional_id: professionalId,
                    appointment_datetime,
                    observations,
                    vinculo,
                });
            }
            toast.success("Agendamento criado com sucesso!", { id: toastId });
            onAppointmentCreated();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Não foi possível agendar.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAppointment = async () => {
        if (!selectedPatient) {
            toast.error("Por favor, selecione um paciente.");
            return;
        }
        // Passo 1: Verificar se há um agendamento futuro.
        if (futureAppointment) {
            setShowFutureScheduleConflictModal(true);
            return;
        }
        // Passo 2: Verificar se está na lista de espera.
        if (waitingListEntry) {
            setShowConflictModal(true);
            return;
        }
        // Se não houver conflitos, cria diretamente.
        await createNewAppointment();
    };
    
    // Limpa o estado quando o modal é fechado ou um novo paciente é selecionado
    const resetSearch = () => {
        setSearchFilters({ name: '', cpf: '', birth_date: '' });
        setSuggestions([]);
        setSelectedPatient(null);
        setHasSearched(false);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                resetSearch();
                setObservations('');
                setShowConflictModal(false);
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Agendar Horário - {slot}</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Formulário de Busca Avançada */}
                        {!selectedPatient && (
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-2">1. Procurar Paciente</label>
                                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <div className="sm:col-span-2">
                                        <input name="name" placeholder="Nome do Paciente" value={searchFilters.name} onChange={handleFilterChange} className="w-full p-2 border rounded-md"/>
                                    </div>
                                    <div>
                                        <input name="cpf" placeholder="CPF" value={searchFilters.cpf} onChange={handleFilterChange} maxLength={14} className="w-full p-2 border rounded-md"/>
                                    </div>
                                    <div>
                                        <input name="birth_date" type="date" value={searchFilters.birth_date} onChange={handleFilterChange} className="w-full p-2 border rounded-md text-gray-500"/>
                                    </div>
                                    <button type="submit" disabled={isSearching} className="sm:col-span-4 flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                                        <Search className="w-5 h-5 mr-2"/>
                                        {isSearching ? 'A buscar...' : 'Buscar'}
                                    </button>
                                </form>
                                {hasSearched && !isSearching && (
                                    <div className="mt-4">
                                        {suggestions.length > 0 ? (
                                            <ul className="space-y-2 max-h-32 overflow-y-auto">
                                                {suggestions.map(p => (
                                                    <li key={p.patient_id} onClick={() => handleSelectPatient(p)} className="p-2 rounded-md cursor-pointer hover:bg-indigo-100 border">
                                                        <p className="font-semibold">{p.name}</p>
                                                        <p className="text-xs text-gray-500">Mãe: {p.mother_name} | Nasc: {p.birth_date_formatted}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-center text-gray-500 py-2">Nenhum paciente encontrado.</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedPatient && (
                            <div className="p-3 bg-green-50 rounded-md border border-green-200 animate-fade-in flex justify-between items-center">
                                 <label className="block text-sm font-medium text-green-800">Paciente Selecionado: <span className="font-bold">{selectedPatient.name}</span></label>
                                <button onClick={resetSearch} className="text-xs font-semibold text-blue-600 hover:underline">Procurar outro</button>
                            </div>
                        )}
                        <div>
                            <label htmlFor="vinculo_agendamento" className="block text-sm font-medium text-gray-700 mb-1">Vínculo do Atendimento</label>
                            <select id="vinculo_agendamento" value={vinculo} onChange={(e) => setVinculo(e.target.value as PatientVinculo)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md">
                                <option value="nenhum">Nenhum</option>
                                <option value="saude">Saúde</option>
                                <option value="educação">Educação</option>
                                <option value="AMA">AMA</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">Observações (Opcional)</label>
                            <textarea id="observations" rows={3} value={observations} onChange={(e) => setObservations(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Alguma nota importante sobre este agendamento?"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancelar</button>
                        <button onClick={handleConfirmAppointment} disabled={!selectedPatient || isLoading}
                            className="py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold">
                            {isLoading ? "A agendar..." : "Confirmar Agendamento"}
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
                    createNewAppointment(waitingListEntry!.appointment_id);
                }}
            />

            {/* Modal de Conflito de Agendamento Futuro */}
            <FutureScheduleConflictModal
                isOpen={showFutureScheduleConflictModal}
                onClose={() => setShowFutureScheduleConflictModal(false)}
                entry={futureAppointment!}
                onConfirm={() => {
                    setShowFutureScheduleConflictModal(false);
                    createNewAppointment(); // Cria um novo agendamento, sem atualizar nenhum existente.
                }}
            />
        </>
    );
}
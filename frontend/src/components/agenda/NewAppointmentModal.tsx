'use client';

import api from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Patient } from '@/types';
import { Search, X, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated: () => void;
    slot: string;
    date: string;
    professionalId: string;
}

export default function NewAppointmentModal({ isOpen, onClose, onAppointmentCreated, slot, date, professionalId }: ModalProps) {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        cpf: '',
        mother_name: '',
        birth_date: ''
    });
    const [suggestions, setSuggestions] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [observations, setObservations] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const debouncedFilters = useDebounce(searchFilters, 500);

    // Efeito para a busca avançada
    useEffect(() => {
        const activeFilters = Object.entries(debouncedFilters).reduce((acc, [key, value]) => {
            if (value) acc[key as keyof typeof acc] = value;
            return acc;
        }, {} as { name?: string; cpf?: string; mother_name?: string; birth_date?: string });

        if (Object.keys(activeFilters).length > 0 && !selectedPatient) {
            setIsSearching(true);
            const fetchPatients = async () => {
                try {
                    const response = await api.get('/patients', { params: activeFilters });
                    setSuggestions(response.data);
                } catch (error) {
                    console.error("Erro ao procurar pacientes:", error);
                    setSuggestions([]);
                } finally {
                    setIsSearching(false);
                }
            };
            fetchPatients();
        } else {
            setSuggestions([]);
        }
    }, [debouncedFilters, selectedPatient]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setSuggestions([]);
    };

    const handleClearSelection = () => {
        setSelectedPatient(null);
        setSearchFilters({ name: '', cpf: '', mother_name: '', birth_date: '' });
    };

    const handleConfirmAppointment = async () => {
        if (!selectedPatient) {
            toast.error("Por favor, selecione um paciente.");
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading("A agendar consulta...");
        const appointment_datetime = `${date}T${slot}:00`;
        try {
            await api.post('/appointments', {
                patient_id: selectedPatient.patient_id,
                professional_id: professionalId,
                appointment_datetime,
                observations,
            });
            toast.success("Agendamento criado com sucesso!", { id: toastId });
            onAppointmentCreated();
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Não foi possível agendar.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSearchFilters({ name: '', cpf: '', mother_name: '', birth_date: '' });
                setSuggestions([]);
                setSelectedPatient(null);
                setObservations('');
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Agendar Horário - {slot}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"><X size={20}/></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">1. Procurar Paciente (preencha um ou mais campos)</label>
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                            <input name="name" placeholder="Nome do Paciente" value={searchFilters.name} onChange={handleFilterChange} className="w-full py-2 px-3 border border-gray-300 rounded-md"/>
                            <input name="mother_name" placeholder="Nome da Mãe" value={searchFilters.mother_name} onChange={handleFilterChange} className="w-full py-2 px-3 border border-gray-300 rounded-md"/>
                            <input name="cpf" placeholder="CPF do Paciente" value={searchFilters.cpf} onChange={handleFilterChange} className="w-full py-2 px-3 border border-gray-300 rounded-md"/>
                            <input name="birth_date" type="date" value={searchFilters.birth_date} onChange={handleFilterChange} className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-500"/>
                        </div>
                    </div>

                    {(isSearching || suggestions.length > 0) && !selectedPatient && (
                        <div className="border rounded-md max-h-48 overflow-y-auto">
                            {isSearching ? <p className="p-4 text-center text-gray-500">A procurar...</p> : 
                            suggestions.map(p => (
                                <div key={p.patient_id} onClick={() => handleSelectPatient(p)} className="px-4 py-2 cursor-pointer hover:bg-indigo-50 border-b last:border-b-0">
                                    <p className="font-semibold">{p.name}</p>
                                    <div className="text-xs text-gray-500 flex items-center gap-x-3">
                                        <span>CPF: {p.cpf || 'N/A'}</span>
                                        <span>Nasc: {p.birth_date_formatted}</span>
                                    </div>
                                </div>
                           ))}
                           {suggestions.length === 0 && !isSearching && <p className="p-4 text-center text-gray-500">Nenhum resultado encontrado.</p>}
                        </div>
                    )}

                    {selectedPatient && (
                        <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200 animate-fade-in">
                             <label className="block text-sm font-medium text-gray-700">2. Paciente Selecionado</label>
                            <div className="flex justify-between items-center mt-1">
                                <p className="font-bold text-lg text-green-800">{selectedPatient.name}</p>
                                <button onClick={handleClearSelection} className="text-xs font-semibold text-blue-600 hover:underline">Procurar outro</button>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">3. Observações (Opcional)</label>
                        <textarea id="observations" rows={3} value={observations} onChange={(e) => setObservations(e.target.value)}
                            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Alguma nota importante sobre este agendamento?"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Link href="/dashboard/pacientes/novo" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        <UserPlus size={16}/>
                        Paciente não encontrado? Cadastre.
                    </Link>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancelar</button>
                        <button onClick={handleConfirmAppointment} disabled={!selectedPatient || isLoading}
                            className="py-2 px-6 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed font-semibold">
                            {isLoading ? "A agendar..." : "Confirmar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { ServiceDetails } from "@/types";

// A interface de props agora precisa da data e de uma função para a alterar
interface PatientHeaderProps {
  details: ServiceDetails;
  appointmentDate?: string; // Tornando opcional para o caso de uso original
  onAppointmentDateChange?: (newDate: string) => void;
}

// Função auxiliar para formatar a data do tipo ISO para o formato que o input aceita (YYYY-MM-DDTHH:mm)
const formatToDateTimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Erro ao formatar a data:", error);
    return '';
  }
};

export default function PatientHeader({ details, appointmentDate, onAppointmentDateChange }: PatientHeaderProps) {
    const formattedDate = new Date(details.appointment_datetime).toLocaleString('pt-BR', {
        dateStyle: 'long', timeStyle: 'short'
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
            {/* 1. O container principal agora empilha em telemóveis (flex-col) e fica em linha em ecrãs maiores (sm:flex-row) */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{details.patient_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">CNS: {details.patient_cns || 'Não informado'}</p>
                </div>
                {/* 2. O div da data agora alinha-se à esquerda em telemóveis e à direita em ecrãs maiores */}
                <div className="w-full sm:w-auto text-left sm:text-right">
                    <span className="block text-sm text-gray-500">Data do Atendimento</span>
                    {onAppointmentDateChange && appointmentDate ? (
                        // Se for editável, mostra o input
                         <input
                            type="datetime-local"
                            id="appointment_datetime_input"
                            name="appointment_datetime"
                            value={formatToDateTimeLocal(appointmentDate)}
                            onChange={(e) => onAppointmentDateChange(e.target.value)}
                            className="mt-1 w-full sm:w-auto font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded-md p-1 sm:text-right"
                        />
                    ) : (
                        // Senão, mostra o texto formatado
                        <span className="font-semibold text-gray-800">{formattedDate}</span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t text-sm">
                <div>
                    <span className="block text-gray-500">Data de Nasc.</span>
                    <span className="font-semibold">{details.patient_birth_date}</span>
                </div>
                <div>
                    <span className="block text-gray-500">CPF</span>
                    <span className="font-semibold">{details.patient_cpf || 'Não informado'}</span>
                </div>
                <div className="col-span-full sm:col-span-1">
                    <span className="block text-gray-500">Nome da Mãe</span>
                    <span className="font-semibold">{details.patient_mother_name}</span>
                </div>
            </div>
        </div>
    );
}

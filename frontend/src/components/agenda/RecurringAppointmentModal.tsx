'use client';

import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';

interface RecurringAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationInMonths: number) => void;
  isLoading: boolean;
}

const durationOptions = [
  { label: '3 Meses', value: 3 },
  { label: '6 Meses', value: 6 },
  { label: '1 Ano', value: 12 },
];

export default function RecurringAppointmentModal({ isOpen, onClose, onConfirm, isLoading }: RecurringAppointmentModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(3);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(selectedDuration);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarClock size={22} />
            Repetir Agendamento
          </h3>
          <button onClick={onClose} disabled={isLoading}><X size={24} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Deseja repetir este agendamento semanalmente? Selecione por quanto tempo.
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          {durationOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedDuration(option.value)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedDuration === option.value
                  ? 'bg-indigo-600 text-white scale-105 shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 rounded-md">
            Não, obrigado
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400"
          >
            {isLoading ? 'A criar...' : 'Confirmar Repetição'}
          </button>
        </div>
      </div>
    </div>
  );
}

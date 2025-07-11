'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Appointment } from '@/types';

// Este hook verifica se um paciente já tem um agendamento futuro.
export function useFutureScheduleCheck(patientId?: string) {
    const [futureAppointment, setFutureAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (patientId) {
            setIsLoading(true);
            api.get('/appointments/check-future-schedule', { params: { patientId } })
                .then(res => setFutureAppointment(res.data))
                .catch(() => setFutureAppointment(null))
                .finally(() => setIsLoading(false));
        } else {
            setFutureAppointment(null);
        }
    }, [patientId]);

    return { futureAppointment, isLoading };
}
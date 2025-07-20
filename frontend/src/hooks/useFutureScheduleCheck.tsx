'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Appointment } from '@/types';

export function useFutureScheduleCheck(patientId?: string, professional_id?: string) {
    const [futureAppointment, setFutureAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (patientId) {
            setIsLoading(true);
            api.get('/appointments/check-future-schedule', { params: { patientId, professional_id } })
                .then(res => setFutureAppointment(res.data))
                .catch(() => setFutureAppointment(null))
                .finally(() => setIsLoading(false));
        } else {
            setFutureAppointment(null);
        }
    }, [patientId]);

    return { futureAppointment, isLoading };
}
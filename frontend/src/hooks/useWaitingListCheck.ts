'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Appointment } from '@/types';

export function useWaitingListCheck(patientId?: string, professionalId?: string) {
    const [waitingListEntry, setWaitingListEntry] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (patientId && professionalId) {
            setIsLoading(true);
            api.get('/appointments/check-waiting-list', { params: { patientId, professionalId } })
                .then(res => setWaitingListEntry(res.data))
                .catch(() => setWaitingListEntry(null))
                .finally(() => setIsLoading(false));
        } else {
            setWaitingListEntry(null);
        }
    }, [patientId, professionalId]);

    return { waitingListEntry, isLoading };
}
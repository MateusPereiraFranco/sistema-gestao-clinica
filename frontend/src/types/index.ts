export type PatientVinculo = 'educação' | 'saude' | 'AMA' | 'nenhum';
export type AppointmentStatus = | 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'justified_absence' | 'unjustified_absence';

export interface Patient {
    patient_id: string;
    name: string;
    cpf: string | null;
    cns: string | null;
    mother_name: string;
    father_name: string | null;
    birth_date: string;
    birth_date_formatted?: string;
    cell_phone_1: string;
    cell_phone_2: string | null;
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    observations: string | null;
    vinculo: PatientVinculo;
}

export interface Appointment {
    appointment_id: string;
    professional_id: string;
    appointment_datetime: string;
    time: string;
    service_type: string;
    status: AppointmentStatus;
    patient_id: string;
    patient_name: string;
    observations: string | null;
    vinculo: PatientVinculo; 
}

export interface User {
    user_id: string;
    name: string;
    email: string;
    profile: 'master' | 'normal';
    specialty_name?: string;
}

export interface ServiceDetails {
    patient_name: string;
    patient_birth_date: string;
    patient_cpf: string | null;
    patient_cns: string | null;
    patient_mother_name: string;
    appointment_id: string;
    professional_id: string;
    appointment_datetime: string;
}

export interface CompletedServiceDetails extends ServiceDetails {
    observations: string | null;
    discharge_given: boolean;
    follow_up_days: number | null;
    professional_name: string;
    specialty_name: string;
    evolution: string;
    referrals: { name: string; specialty_name: string }[];
}
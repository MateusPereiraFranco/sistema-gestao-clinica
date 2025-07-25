export type PatientVinculo = 'educação' | 'saude' | 'AMA' | 'nenhum';
export type AppointmentStatus = | 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'justified_absence' | 'unjustified_absence' | 'canceled' | 'on_waiting_list';

export interface Unit {
    unit_id: string;
    name: string;
    is_active?: boolean;
    address?: string
}

export interface Specialty {
    specialty_id: string;
    name: string;
}

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
    unit_id: string | null;
}

export interface Appointment {
    appointment_id: string;
    professional_id: string;
    appointment_datetime: string;
    time: string;
    date: string;
    service_type: string;
    status: AppointmentStatus;
    patient_id: string;
    patient_name: string;
    observations: string | null;
    vinculo: PatientVinculo; 
    professional_name?: string;
    patient_cpf: string | null;
    patient_mother_name: string;
    date_formatted: string;
    patient_birth_date: string;
    request_date?: string;
    created_by_name?: string;
    formatted_date?: string;
    recurring_group_id?: string;
}

export interface User {
    user_id: string;
    name: string;
    email: string;
    profile: 'admin | master' | 'normal';
    specialty_name?: string;
    unit_id: string | null;
    unit_name?: string;
    is_active: boolean;
    specialty_id?: string | null;
    has_agenda: boolean;
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
    patient_id: string;
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
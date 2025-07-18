import { AppointmentStatus } from "@/types"; // Importe o tipo para garantir a consistência

export const statusLabels: { [key in AppointmentStatus]?: string } = {
    completed: 'Finalizado',
    scheduled: 'Agendado',
    canceled: 'Cancelado',
    in_progress: 'Não Finalizado',
    waiting: 'Aguardando',
    justified_absence: 'Falta Justificada',
    unjustified_absence: 'Falta não Justifiada',
};

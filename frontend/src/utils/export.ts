import { Appointment, AppointmentStatus } from '@/types';
import { statusLabels } from './statusUtils';

export function exportGroupedWithDetailsToCSV(
  summaryData: any[], 
  detailsData: Record<string, Appointment[]>, 
  filename: string,
  unitName: string
) {
    const mainHeaders = ["Profissional", "Especialidade", "Vínculo - Saúde", "Vínculo - Educação", `Vínculo - ${unitName}`, "Vínculo - Nenhum", "Total"];
    let csvRows = [mainHeaders.join(';')];

    const detailHeaders = ["", "Data/Hora", "Paciente", "CPF", "Vínculo", "Status", "Observações"];

    for (const summaryRow of summaryData) {
        const summaryValues = [
            `"${summaryRow.professional_name}"`,
            `"${summaryRow.specialty_name || 'N/A'}"`,
            summaryRow.summary.saude,
            summaryRow.summary.educacao,
            summaryRow.summary.AMA,
            summaryRow.summary.nenhum,
            summaryRow.total
        ];
        csvRows.push(summaryValues.join(';'));

        const details = detailsData[summaryRow.user_id];
        if (details && details.length > 0) {
            csvRows.push(''); 
            csvRows.push(detailHeaders.join(';'));

            for (const detail of details) {
                const detailValues = [
                    "",
                    `"${detail.date_formatted || new Date(detail.appointment_datetime).toLocaleDateString('pt-BR')} às ${detail.time}"`,
                    `"${detail.patient_name}"`,
                    `"${detail.patient_cpf || 'N/A'}"`,
                    `"${detail.vinculo === 'AMA' ? unitName : detail.vinculo}"`,
                    `"${statusLabels[detail.status as AppointmentStatus] || detail.status}"`,
                    `"${(detail.observations || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(detailValues.join(';'));
            }
            csvRows.push(''); 
        }
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

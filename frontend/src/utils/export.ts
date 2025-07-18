import { statusLabels } from './statusUtils'; // Importe seu mapa de traduções

// A função agora aceita os dados do resumo e um objeto com os detalhes
export function exportGroupedWithDetailsToCSV(
  summaryData: any[], 
  detailsData: Record<string, any[]>, 
  filename: string
) {
    const mainHeaders = ["Profissional", "Especialidade", "Vínculo - Saúde", "Vínculo - Educação", "Vínculo - AMA", "Vínculo - Nenhum", "Total"];
    let csvRows = [mainHeaders.join(';')];

    // Cabeçalho para a seção de detalhes dos atendimentos
    const detailHeaders = ["", "Data/Hora", "Paciente", "CPF", "Vínculo", "Status", "Observações"]; // A primeira coluna vazia serve para indentar os detalhes

    // Itera sobre cada linha de resumo (cada profissional)
    for (const summaryRow of summaryData) {
        // Adiciona a linha de resumo do profissional
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

        // Verifica se existem detalhes carregados para este profissional
        const details = detailsData[summaryRow.user_id];
        if (details && details.length > 0) {
            // Adiciona uma linha em branco para espaçamento e o cabeçalho dos detalhes
            csvRows.push(''); 
            csvRows.push(detailHeaders.join(';'));

            // Itera sobre cada atendimento detalhado e o adiciona ao CSV
            for (const detail of details) {
                const detailValues = [
                    "", // Coluna de indentação
                    `"${detail.date_formatted || detail.appointment_datetime} às ${detail.time}"`,
                    `"${detail.patient_name}"`,
                    `"${detail.patient_cpf || 'N/A'}"`,
                    `"${detail.vinculo}"`,
                    `"${statusLabels[detail.status] || detail.status}"`,
                    `"${(detail.observations || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(detailValues.join(';'));
            }
            // Adiciona outra linha em branco para separar do próximo profissional
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

export function exportGroupedToCSV(data: any[], filename: string) {
    const headers = ["Profissional", "Especialidade", "Vínculo - Saúde", "Vínculo - Educação", "Vínculo - AMA", "Vínculo - Nenhum", "Total"];
    const csvRows = [headers.join(';')];

    for (const row of data) {
        const values = [
            `"${row.professional_name}"`,
            `"${row.specialty_name || 'N/A'}"`,
            row.summary.saude,
            row.summary.educação,
            row.summary.AMA,
            row.summary.nenhum,
            row.total
        ];
        csvRows.push(values.join(';'));
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
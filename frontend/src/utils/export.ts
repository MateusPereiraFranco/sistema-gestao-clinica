/**
 * Exporta dados para um ficheiro CSV compatível com o Excel em português.
 * @param headers Array com os nomes das colunas (ex: ["Profissional", "Especialidade"]).
 * @param data Array de objetos com os dados. As chaves devem corresponder aos headers normalizados.
 * @param filename O nome do ficheiro a ser descarregado (sem a extensão .csv).
 */
export function exportToCSV(headers: string[], data: any[], filename: string) {
    const csvRows = [];
    
    // 1. Adiciona os cabeçalhos, usando ponto e vírgula como separador.
    csvRows.push(headers.join(';'));

    // 2. Adiciona as linhas de dados.
    for (const row of data) {
        const values = headers.map(header => {
            // Normaliza o cabeçalho para criar uma chave de objeto segura (ex: "Nº de Atendimentos" -> "n_de_atendimentos")
            const key = header.toLowerCase()
                .replace(/ /g, '_')
                .replace(/º/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/ã/g, 'a');
            
            // Escapa as aspas duplas dentro do valor e envolve todo o valor em aspas duplas.
            const escaped = ('' + (row[key] || '')).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        // Junta os valores da linha com ponto e vírgula.
        csvRows.push(values.join(';'));
    }

    const csvString = csvRows.join('\n');
    
    // 3. Cria o Blob com o BOM para garantir a correta interpretação de caracteres especiais (UTF-8).
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 4. Cria um link temporário e simula um clique para iniciar o download.
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
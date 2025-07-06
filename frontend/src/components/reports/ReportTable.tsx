'use client';

import { exportToCSV } from '@/utils/export';
import { Download } from 'lucide-react';

interface ReportData {
    professional_name: string;
    specialty_name: string;
    service_count: number;
}

interface ReportTableProps {
    data: ReportData[];
    period: string;
}

export default function ReportTable({ data, period }: ReportTableProps) {
    // Se não houver dados, o componente não renderiza nada.
    if (data.length === 0) {
        return null;
    }

    const totalServices = data.reduce((sum, item) => sum + Number(item.service_count), 0);
    
    const handleExport = () => {
        const headers = ["Profissional", "Especialidade", "Nº de Atendimentos"];
        const formattedData = data.map(item => ({
            profissional: item.professional_name,
            especialidade: item.specialty_name || 'N/A',
            no_de_atendimentos: item.service_count
        }));
        exportToCSV(headers, formattedData, `relatorio_atendimentos_${period.replace(/\//g, '-')}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Resultado do Relatório</h3>
                    <p className="text-sm text-gray-500">Período: {period}</p>
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700">
                    <Download size={16}/>
                    Exportar para CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº de Atendimentos</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.professional_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.specialty_name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.service_count}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={2} className="px-6 py-3 text-right text-sm font-bold text-gray-700">Total de Atendimentos:</td>
                            <td className="px-6 py-3 text-left text-sm font-bold text-gray-900">{totalServices}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
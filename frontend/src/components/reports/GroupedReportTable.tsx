'use client';

import { exportGroupedToCSV } from '@/utils/export';
import { Download, ChevronsRight } from 'lucide-react';

interface ReportData {
    professional_name: string;
    specialty_name: string;
    summary: {
        saude: number;
        educação: number;
        AMA: number;
        nenhum: number;
    };
    total: number;
}

interface ReportTableProps {
    data: ReportData[];
    period: string;
}

export default function GroupedReportTable({ data, period }: ReportTableProps) {
    if (data.length === 0) {
        return <p className="text-center text-gray-500 py-8">Nenhum dado para exibir.</p>;
    }

    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
    
    const handleExport = () => {
        exportGroupedToCSV(data, `relatorio_agrupado_${period.replace(/\//g, '-')}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Relatório de Atendimentos por Profissional</h3>
                    <p className="text-sm text-gray-500">Período: {period}</p>
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700">
                    <Download size={16}/>
                    Exportar para CSV
                </button>
            </div>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-indigo-700">{item.professional_name}</p>
                                <p className="text-sm text-gray-500">{item.specialty_name || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total de Atendimentos</p>
                                <p className="font-bold text-xl text-gray-800">{item.total}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center"><p className="text-xs text-gray-500">Saúde</p><p className="font-semibold">{item.summary.saude}</p></div>
                            <div className="text-center"><p className="text-xs text-gray-500">Educação</p><p className="font-semibold">{item.summary.educação}</p></div>
                            <div className="text-center"><p className="text-xs text-gray-500">AMA</p><p className="font-semibold">{item.summary.AMA}</p></div>
                            <div className="text-center"><p className="text-xs text-gray-500">Nenhum</p><p className="font-semibold">{item.summary.nenhum}</p></div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="text-right font-bold text-lg mt-6 pt-4 border-t">
                Total Geral de Atendimentos: <span className="text-indigo-700">{grandTotal}</span>
            </div>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp } from 'lucide-react'; // Usando seus ícones lucide-react
import { exportGroupedWithDetailsToCSV } from '@/utils/export'; // Seu utilitário de exportação
import api from "@/services/api"; // Importando sua instância de API
import toast from "react-hot-toast"; // Usando react-hot-toast
import { Appointment, AppointmentStatus } from "@/types"; // Importando sua interface Appointment e PatientVinculo para os detalhes
import { statusLabels } from '@/utils/statusUtils';

interface ReportData {
    user_id: string;
    professional_name: string;
    specialty_name: string;
    summary: {
        saude: number;
        educacao: number;
        AMA: number;
        nenhum: number;
    };
    total: number;
}

// Interface para os filtros passados da página principal
interface ReportTableProps {
    data: ReportData[];
    period: string;
    filters: { // Filtros gerais da página de relatório
        startDate: string;
        endDate: string;
        professionalId: string; // Este é o filtro geral, pode ser 'all'
        unitId: string;
        includeInactive: boolean; // CORREÇÃO: Alterado para boolean
        status: string;
    };
    token: string | null; // Token de autenticação
}

export default function GroupedReportTable({ data, period, filters, token }: ReportTableProps) {
    // Estado para controlar qual profissional/linha está expandida e seus dados detalhados
    // A chave será o user_id do profissional
    const [expandedProfessionalDetails, setExpandedProfessionalDetails] = useState<Record<string, Appointment[]>>({});
    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

    if (data.length === 0) {
        console.log('data', data)
        return <p className="text-center text-gray-500 py-8">Nenhum dado para exibir.</p>;
    }

    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

    const [isExporting, setIsExporting] = useState(false);
    
    // Função para exportar os dados do relatório para CSV
    const handleExport = async () => {
        setIsExporting(true);
        toast.loading('Preparando dados para exportação...');

        try {
            // Cria uma cópia dos detalhes já carregados
            const allDetails = { ...expandedProfessionalDetails };

            // Mapeia as promises para buscar os detalhes que ainda não foram carregados
            const detailPromises = data
                .filter(item => !allDetails[item.user_id]) // Filtra apenas os que não estão no estado
                .map(item => {
                    const params = {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        professionalId: item.user_id,
                        includeInactive: filters.includeInactive,
                        ...(filters.status && filters.status !== 'all' && { statusArray: [filters.status] })
                    };
                    return api.get(`/appointments/detailed-report`, { params, headers: { 'Authorization': `Bearer ${token}` } });
                });

            // Executa todas as buscas em paralelo
            const results = await Promise.all(detailPromises);

            // Adiciona os novos detalhes ao nosso objeto 'allDetails'
            results.forEach((response, index) => {
                const professionalId = data.filter(item => !expandedProfessionalDetails[item.user_id])[index].user_id;
                allDetails[professionalId] = response.data.data.appointments;
            });

            toast.dismiss(); // Remove o toast de loading
            
            // Chama a função de exportação com todos os dados (resumo + detalhes completos)
            exportGroupedWithDetailsToCSV(
                data,
                allDetails,
                `relatorio_completo_${period.replace(/\//g, '-')}`
            );

        } catch (error) {
            console.error("Erro ao preparar dados para exportação:", error);
            toast.dismiss();
            toast.error("Falha ao gerar o relatório completo.");
        } finally {
            setIsExporting(false);
        }
    };

    // Função para formatar a data para exibição
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error("Erro ao formatar data:", dateString, error);
            return dateString;
        }
    };

    // Função para lidar com a expansão/colapso de uma linha de profissional
    const toggleProfessionalExpansion = async (professionalId: string) => {
        if (expandedProfessionalDetails[professionalId]) {
            setExpandedProfessionalDetails(prev => {
                const newExpanded = { ...prev };
                delete newExpanded[professionalId];
                return newExpanded;
            });
        } else {
            setLoadingDetails(prev => ({ ...prev, [professionalId]: true }));
            try {
                // 1. Crie um objeto de parâmetros simples
                const detailedFiltersParams: any = {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    professionalId: professionalId,
                    includeInactive: filters.includeInactive,
                };

                // 2. Adicione o filtro de unidade se existir
                if (filters.unitId) {
                    detailedFiltersParams.unitId = filters.unitId;
                }

                // 3. Adicione o filtro de status dinamicamente
                //    A API de detalhes espera 'statusArray'
                if (filters.status && filters.status !== 'all') {
                    detailedFiltersParams.statusArray = [filters.status];
                }
                
                // 4. Deixe o axios formatar os parâmetros para você
                //    Ele vai converter 'statusArray' para 'statusArray[]=' na URL, o que é perfeito
                const response = await api.get(`/appointments/detailed-report`, {
                    params: detailedFiltersParams, // Passando o objeto de parâmetros aqui
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status !== 200) {
                    throw new Error('Falha ao buscar detalhes dos atendimentos');
                }

                setExpandedProfessionalDetails(prev => ({ ...prev, [professionalId]: response.data.data.appointments }));
            } catch (error) {
                console.error('Erro ao buscar detalhes:', error);
                toast.error("Erro ao carregar detalhes dos atendimentos.");
            } finally {
                setLoadingDetails(prev => ({ ...prev, [professionalId]: false }));
            }
        }
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
                {data.map((item) => {
                    const isExpanded = !!expandedProfessionalDetails[item.user_id];
                    const isLoadingCurrentDetails = loadingDetails[item.user_id];
                    return (
                        <React.Fragment key={item.user_id}>
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-indigo-700">{item.professional_name}</p>
                                        <p className="text-sm text-gray-500">{item.specialty_name || 'N/A'}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-4"> {/* Adicionado flex para o botão */}
                                        <div>
                                            <p className="text-sm text-gray-500">Total de Atendimentos</p>
                                            <p className="font-bold text-xl text-gray-800">{item.total}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleProfessionalExpansion(item.user_id)}
                                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                            disabled={isLoadingCurrentDetails}
                                            aria-label={isExpanded ? "Colapsar detalhes" : "Expandir detalhes"}
                                        >
                                            {isLoadingCurrentDetails ? (
                                                <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                isExpanded ? (
                                                    <ChevronUp size={20} className="text-gray-600" />
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-600" />
                                                )
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                    <div className="text-center"><p className="text-xs text-gray-500">Saúde</p><p className="font-semibold">{item.summary.saude}</p></div>
                                    <div className="text-center"><p className="text-xs text-gray-500">Educação</p><p className="font-semibold">{item.summary.educacao}</p></div>
                                    <div className="text-center"><p className="text-xs text-gray-500">AMA</p><p className="font-semibold">{item.summary.AMA}</p></div>
                                    <div className="text-center"><p className="text-xs text-gray-500">Nenhum</p><p className="font-semibold">{item.summary.nenhum}</p></div>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200">
                                    <h4 className="text-md font-semibold mb-3 text-gray-700">Detalhes dos Atendimentos de {item.professional_name}:</h4>
        
                                    {expandedProfessionalDetails[item.user_id]?.length > 0 ? (
                                    <table className="min-w-full w-full text-sm text-left">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 font-semibold text-gray-600">Data/Hora</th>
                                                <th className="p-2 font-semibold text-gray-600">Paciente</th>
                                                <th className="p-2 font-semibold text-gray-600">CPF</th>
                                                <th className="p-2 font-semibold text-gray-600">Vínculo</th>
                                                <th className="p-2 font-semibold text-gray-600">Status</th>
                                                <th className="p-2 font-semibold text-gray-600">Obs.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expandedProfessionalDetails[item.user_id].map((detail) => (
                                                <tr key={detail.appointment_id} className="border-b border-gray-200 hover:bg-gray-100">
                                                    <td className="p-2 text-gray-700 whitespace-nowrap">
                                                        {formatDateForDisplay(detail.appointment_datetime)} às {detail.time}
                                                    </td>
                                                    <td className="p-2 text-gray-700">{detail.patient_name}</td>
                                                    <td className="p-2 text-gray-700">{detail.patient_cpf || 'N/A'}</td>
                                                    <td className="p-2 text-gray-700">{detail.vinculo}</td>
                                                    <td className="p-2 text-gray-700">{statusLabels[detail.status as AppointmentStatus] || detail.status}</td>
                                                    <td className="p-2 text-gray-700 max-w-xs truncate" title={detail.observations}>
                                                        {detail.observations || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    ) : (
                                        <p className="text-gray-600 text-center py-4">Nenhum detalhe de atendimento encontrado para este profissional no período e com o filtro de status selecionado.</p>
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="text-right font-bold text-lg mt-6 pt-4 border-t">
                Total Geral de Atendimentos: <span className="text-indigo-700">{grandTotal}</span>
            </div>
        </div>
    );
}

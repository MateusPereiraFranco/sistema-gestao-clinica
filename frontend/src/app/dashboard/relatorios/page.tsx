'use client';

import Header from "@/components/layout/Header";
import ReportFilters from "@/components/reports/ReportFilters";
import GroupedReportTable from "@/components/reports/GroupedReportTable";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { User, PatientVinculo } from "@/types"; // Importando sua interface User e PatientVinculo
import api from "@/services/api";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

// Interface para o resumo do relatório vindo do backend (REVISADA COM BASE NO SEU LOG)
interface ReportSummary {
  user_id: string;
  professional_name: string;
  has_agenda: boolean; // Adicionado com base no seu log
  specialty_name: string;
  summary: {
    saude: number;
    'educação': number; // A chave real com 'ç' vinda do backend
    AMA: number;
    nenhum: number;
  };
  vinculo?: PatientVinculo; // Tornando opcional, pois parece redundante se o summary já está presente
  service_count: number; // Parece ser o total para o profissional, ou redundante se o summary for a fonte principal
}

// Interface para os dados do relatório que o GroupedReportTable espera (permanece a mesma)
interface TransformedReportData {
    user_id: string;
    professional_name: string;
    specialty_name: string;
    summary: {
        saude: number;
        educacao: number; // Chave sem 'ç' para o frontend
        AMA: number;
        nenhum: number;
    };
    total: number;
}

export default function RelatoriosPage() {
    const { user, token } = useAuthStore();
    const { reportProfessional, reportStartDate, reportEndDate, setReportProfessional, includeInactive } = useFilterStore();
    
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [rawReportData, setRawReportData] = useState<ReportSummary[]>([]); // Dados brutos do backend
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (token) {
            api.get('/users', { 
                params: { is_active: !includeInactive },
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const profList = res.data.filter((u: User) => u.has_agenda);
                setProfessionals(profList);
                if (user?.profile === 'normal') setReportProfessional(user.user_id);
            }).catch(error => {
                console.error("Erro ao carregar profissionais:", error);
                toast.error("Erro ao carregar lista de profissionais.");
            });
        }
    }, [user, setReportProfessional, includeInactive, token]);

    const handleSearch = async () => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const params = {
                professionalId: reportProfessional,
                startDate: reportStartDate,
                endDate: reportEndDate,
                includeInactive: includeInactive
            };
            const response = await api.get('/reports/services-summary', { 
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setRawReportData(response.data);
            if(response.data.length === 0) {
                toast.success("Nenhum atendimento encontrado para este período.");
            }
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            toast.error("Erro ao gerar relatório.");
            setRawReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para transformar os dados do backend para o formato que o GroupedReportTable espera
    const transformedReportData = useMemo(() => {
        console.log('--- rawReportData for Transformation ---', rawReportData); // Log dos dados brutos

        const transformed: TransformedReportData[] = rawReportData.map(item => {
            console.log('Processing item for direct transformation:', item);

            // Garante que as contagens do summary são números
            const countSaude = Number(item.summary.saude) || 0;
            // Acessa a chave com 'ç' e converte para número
            const countEducacao = Number(item.summary['educação']) || 0; 
            const countAMA = Number(item.summary.AMA) || 0;
            const countNenhum = Number(item.summary.nenhum) || 0;

            // O total é a soma de todos os vínculos do summary
            const totalForProfessional = countSaude + countEducacao + countAMA + countNenhum;

            const transformedItem: TransformedReportData = {
                user_id: item.user_id,
                professional_name: item.professional_name,
                specialty_name: item.specialty_name,
                summary: {
                    saude: countSaude,
                    educacao: countEducacao, // Atribui à chave sem 'ç'
                    AMA: countAMA,
                    nenhum: countNenhum,
                },
                total: totalForProfessional,
            };

            console.log('Transformed item:', transformedItem);
            return transformedItem;
        });

        console.log('--- Final Transformed Report Data ---', transformed); // Log dos dados transformados finais
        return transformed;
    }, [rawReportData]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString + 'T12:00:00Z');
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error("Erro ao formatar data:", dateString, error);
            return dateString;
        }
    };

    return (
        <>
            <Header title="Relatórios e Análises" />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <ReportFilters professionals={professionals} onSearch={handleSearch} isLoading={isLoading} />
                
                {hasSearched && !isLoading && (
                    <GroupedReportTable 
                        data={transformedReportData}
                        period={`${formatDate(reportStartDate)} a ${formatDate(reportEndDate)}`}
                        filters={{
                            startDate: reportStartDate,
                            endDate: reportEndDate,
                            professionalId: reportProfessional,
                            unitId: '',
                            includeInactive: includeInactive
                        }} 
                        token={token}
                    />
                )}
                {hasSearched && !isLoading && rawReportData.length === 0 && (
                    <p className="text-center text-gray-600 mt-4">Nenhum atendimento encontrado para o período selecionado.</p>
                )}
            </main>
        </>
    );
}

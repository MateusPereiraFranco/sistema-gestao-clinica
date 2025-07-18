'use client';

import Header from "@/components/layout/Header";
import ReportFilters from "@/components/reports/ReportFilters";
import GroupedReportTable from "@/components/reports/GroupedReportTable";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { User, PatientVinculo, AppointmentStatus } from "@/types"; // Importe AppointmentStatus
import api from "@/services/api";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

// ... (suas interfaces ReportSummary e TransformedReportData permanecem as mesmas)
interface ReportSummary {
    user_id: string;
    professional_name: string;
    has_agenda: boolean;
    specialty_name: string;
    summary: {
        saude: number;
        'educação': number;
        AMA: number;
        nenhum: number;
    };
    vinculo?: PatientVinculo;
    service_count: number;
}

interface TransformedReportData {
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


export default function RelatoriosPage() {
    const { user, token } = useAuthStore();
    // 1. Obtenha o 'reportStatus' da sua store
    const { 
        reportProfessional, 
        reportStartDate, 
        reportEndDate, 
        setReportProfessional, 
        includeInactive,
        reportStatus
    } = useFilterStore();
    
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [rawReportData, setRawReportData] = useState<ReportSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const availableStatuses: AppointmentStatus[] = ['completed', 'in_progress', 'justified_absence', 'unjustified_absence','waiting','scheduled', 'canceled'];

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
                includeInactive: includeInactive,
                status: reportStatus
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

    // A função de transformação não precisa mudar, ela vai funcionar corretamente
    const transformedReportData = useMemo(() => {
        // ... seu código de transformação aqui ...
        // (sem alterações necessárias)
        const transformed: TransformedReportData[] = rawReportData.map(item => {
            const countSaude = Number(item.summary.saude) || 0;
            const countEducacao = Number(item.summary['educação']) || 0; 
            const countAMA = Number(item.summary.AMA) || 0;
            const countNenhum = Number(item.summary.nenhum) || 0;
            const totalForProfessional = countSaude + countEducacao + countAMA + countNenhum;
            return {
                user_id: item.user_id,
                professional_name: item.professional_name,
                specialty_name: item.specialty_name,
                summary: {
                    saude: countSaude,
                    educacao: countEducacao,
                    AMA: countAMA,
                    nenhum: countNenhum,
                },
                total: totalForProfessional,
            };
        });
        return transformed;
    }, [rawReportData]);

    const formatDate = (dateString: string) => {
        // ... seu código de formatação aqui ...
        // (sem alterações necessárias)
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
                {/* 3. Passe a lista de status para o componente ReportFilters */}
                <ReportFilters 
                    professionals={professionals} 
                    status={availableStatuses}
                    onSearch={handleSearch} 
                    isLoading={isLoading} 
                />
                
                {hasSearched && !isLoading && (
                    <GroupedReportTable 
                        data={transformedReportData}
                        period={`${formatDate(reportStartDate)} a ${formatDate(reportEndDate)}`}
                        filters={{
                            startDate: reportStartDate,
                            endDate: reportEndDate,
                            professionalId: reportProfessional,
                            unitId: '',
                            includeInactive: includeInactive,
                            status: reportStatus
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
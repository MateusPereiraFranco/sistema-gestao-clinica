'use client';

import Header from "@/components/layout/Header";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { User } from "@/types";
import api from "@/services/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function RelatoriosPage() {
    const { user } = useAuthStore();
    const { 
        reportProfessional, 
        reportStartDate, 
        reportEndDate,
        setReportProfessional,
    } = useFilterStore();
    
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Controla se uma busca já foi feita

    useEffect(() => {
        api.get('/users').then(res => {
            const profList = res.data.filter((u: User) => u.profile === 'normal');
            setProfessionals(profList);
            if (user?.profile === 'normal') {
                setReportProfessional(user.user_id);
            }
        });
    }, [user, setReportProfessional]);

    const handleSearch = async () => {
        setIsLoading(true);
        setHasSearched(true); // Marca que a primeira busca foi feita
        try {
            const params = {
                professionalId: reportProfessional,
                startDate: reportStartDate,
                endDate: reportEndDate,
            };
            const response = await api.get('/reports/services-summary', { params });
            setReportData(response.data);
            if(response.data.length === 0) {
                toast.success("Nenhum atendimento concluído foi encontrado para este período.");
            }
        } catch (error) {
            toast.error("Erro ao gerar relatório.");
            setReportData([]); // Limpa os dados em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString + 'T12:00:00Z').toLocaleDateString('pt-BR');

    return (
        <>
            <Header title="Relatórios e Análises" />
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <ReportFilters professionals={professionals} onSearch={handleSearch} isLoading={isLoading} />
                
                {/* A tabela só é renderizada se uma busca já tiver sido feita */}
                {hasSearched && !isLoading && (
                    <ReportTable data={reportData} period={`${formatDate(reportStartDate)} a ${formatDate(reportEndDate)}`} />
                )}
            </main>
        </>
    );
}
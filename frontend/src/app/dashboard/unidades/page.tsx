'use client';

import { useState, useEffect, useCallback } from 'react';
import { Unit } from '@/types';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import UnitTable from '@/components/units/UnitTable';
import UnitFormModal from '@/components/units/UnitFormModal';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function GerirUnidadesPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    // Função para buscar as unidades
    const fetchUnits = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/units');
            setUnits(response.data);
        } catch (error) {
            toast.error("Falha ao carregar as unidades.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.profile !== 'admin') {
            router.replace('/dashboard');
            return;
        }
        fetchUnits();
    }, [user, router, fetchUnits]);

    // Lida com o salvamento (criação ou edição)
    const handleSave = async (unitData: Partial<Unit>) => {
        try {
            if (editingUnit) {
                // Edição
                await api.patch(`/units/${editingUnit.unit_id}`, unitData);
                toast.success("Unidade atualizada com sucesso!");
            } else {
                // Criação
                await api.post('/units', unitData);
                toast.success("Unidade criada com sucesso!");
            }
            setIsModalOpen(false);
            setEditingUnit(null);
            fetchUnits(); // Recarrega a lista
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || "Ocorreu um erro.";
            toast.error(message);
            return false;
        }
    };
    
    // Lida com a ativação/desativação
    const handleToggleStatus = async (unitId: string) => {
        try {
            await api.patch(`/units/${unitId}/toggle-active`);
            toast.success("Status da unidade alterado com sucesso!");
            fetchUnits();
        } catch (error) {
            toast.error("Falha ao alterar o status da unidade.");
        }
    };

    const openCreateModal = () => {
        setEditingUnit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };

    const headerAction = (
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700">
            <PlusCircle size={20} />
            Adicionar Unidade
        </button>
    );

    return (
        <>
            <Header title="Gestão de Unidades" action={headerAction} />
            <main className="flex-1 overflow-y-auto p-6">
                <UnitTable 
                    units={units} 
                    isLoading={isLoading} 
                    onEdit={openEditModal} 
                    onToggleStatus={handleToggleStatus} 
                />
            </main>
            {isModalOpen && (
                <UnitFormModal 
                    unit={editingUnit}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
}
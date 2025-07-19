'use client';

import { Unit } from '@/types';
import { Edit, ToggleLeft, ToggleRight } from 'lucide-react';

interface UnitTableProps {
    units: Unit[];
    isLoading: boolean;
    onEdit: (unit: Unit) => void;
    onToggleStatus: (unitId: string) => void;
}

export default function UnitTable({ units, isLoading, onEdit, onToggleStatus }: UnitTableProps) {
    if (isLoading) {
        return <p className="text-center py-8">A carregar unidades...</p>;
    }

    if (units.length === 0) {
        return <p className="text-center py-8">Nenhuma unidade encontrada.</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Nome</th>
                        <th className="p-4 font-semibold text-gray-600">Endereço</th>
                        <th className="p-4 font-semibold text-gray-600">Status</th>
                        <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit) => (
                        <tr key={unit.unit_id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-4">{unit.name}</td>
                            <td className="p-4 text-gray-600">{unit.address || 'N/A'}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unit.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {unit.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => onToggleStatus(unit.unit_id)} className="p-2 text-gray-500 hover:text-gray-800" title={unit.is_active ? 'Desativar' : 'Reativar'}>
                                    {unit.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                                <button onClick={() => onEdit(unit)} className="p-2 text-gray-500 hover:text-indigo-600" title="Editar">
                                    <Edit size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Unit } from '@/types';
import { X } from 'lucide-react';

interface UnitFormModalProps {
    unit: Unit | null;
    onClose: () => void;
    onSave: (unitData: Partial<Unit>) => Promise<boolean>;
}

export default function UnitFormModal({ unit, onClose, onSave }: UnitFormModalProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (unit) {
            setName(unit.name);
            setAddress(unit.address || '');
        }
    }, [unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onSave({ name, address });
        if (!success) {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{unit ? 'Editar Unidade' : 'Nova Unidade'}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="unit_name" className="block text-sm font-medium text-gray-700">Nome da Unidade</label>
                            <input
                                id="unit_name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="unit_address" className="block text-sm font-medium text-gray-700">Endereço (Opcional)</label>
                            <input
                                id="unit_address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">
                            {isSaving ? 'A salvar...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

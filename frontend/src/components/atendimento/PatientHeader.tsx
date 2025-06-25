import { ServiceDetails } from "@/types";

interface PatientHeaderProps {
    details: ServiceDetails;
}

export default function PatientHeader({ details }: PatientHeaderProps) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{details.patient_name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                    <span className="block text-gray-500">Data de Nasc.</span>
                    <span className="font-semibold">{details.patient_birth_date}</span>
                </div>
                <div>
                    <span className="block text-gray-500">CPF</span>
                    <span className="font-semibold">{details.patient_cpf || 'Não informado'}</span>
                </div>
                <div className="col-span-2">
                    <span className="block text-gray-500">Nome da Mãe</span>
                    <span className="font-semibold">{details.patient_mother_name}</span>
                </div>
            </div>
        </div>
    );
}
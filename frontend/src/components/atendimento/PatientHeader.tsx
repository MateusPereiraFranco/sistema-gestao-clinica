import { ServiceDetails } from "@/types";

export default function PatientHeader({ details }: { details: ServiceDetails }) {
    const formattedDate = new Date(details.appointment_datetime).toLocaleString('pt-BR', {
        dateStyle: 'long', timeStyle: 'short'
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{details.patient_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">CNS: {details.patient_cns || 'Não informado'}</p>
                </div>
                <div className="text-right">
                    <span className="block text-sm text-gray-500">Data do Atendimento</span>
                    <span className="font-semibold text-gray-800">{formattedDate}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t text-sm">
                <div>
                    <span className="block text-gray-500">Data de Nasc.</span>
                    <span className="font-semibold">{details.patient_birth_date}</span>
                </div>
                <div>
                    <span className="block text-gray-500">CPF</span>
                    <span className="font-semibold">{details.patient_cpf || 'Não informado'}</span>
                </div>
                <div className="col-span-full md:col-span-1">
                    <span className="block text-gray-500">Nome da Mãe</span>
                    <span className="font-semibold">{details.patient_mother_name}</span>
                </div>
            </div>
        </div>
    );
}
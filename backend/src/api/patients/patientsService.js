const patientModel = require('./patientsModel');
const { isValidCPF, isValidCNS } = require('../../utils/validators');

exports.getAllPatients = (filters) => {
    return patientModel.findWithFilters(filters);
};

exports.getPatientForEdit = async (id) => {
    const patient = await patientModel.findByIdForEdit(id);
    if (!patient) {
        const error = new Error('Paciente não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    return patient;
};

// A validação foi atualizada para não exigir o campo 'observations'
exports.createPatient = async (patientData, userId) => {
    const requiredFields = [
        'name', 'birth_date', 'mother_name', 'cell_phone_1',
        'cep', 'street', 'number', 'neighborhood', 'city', 'state',
        'vinculo' // <-- Adicionado à lista de campos obrigatórios
    ];

    for (const field of requiredFields) {
        if (!patientData[field]) {
            const error = new Error(`O campo '${field}' é obrigatório.`);
            error.statusCode = 400;
            throw error;
        }
    }

    if (patientData.cpf) {
        if (!isValidCPF(patientData.cpf)) {
            throw new Error('O CPF fornecido é inválido.');
        }
        const existingPatient = await patientModel.findByCpf(patientData.cpf);
        if (existingPatient) {
            const error = new Error('O CPF fornecido já está registado noutro paciente.');
            error.statusCode = 409;
            throw error;
        }
    }
    if (patientData.cns && !isValidCNS(patientData.cns)) {
        throw new Error('O Cartão do SUS (CNS) fornecido é inválido.');
    }

    const fullPatientData = { ...patientData, registered_by: userId };
    return patientModel.create(fullPatientData);
};


exports.updatePatient = async (id, patientData) => {
    const patientToUpdate = await patientModel.findById(id);
    if (!patientToUpdate) {
        const error = new Error('Paciente a ser atualizado não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (patientData.cpf) {
        if (!isValidCPF(patientData.cpf)) {
            throw new Error('O CPF fornecido é inválido.');
        }
        const existingPatient = await patientModel.findByCpf(patientData.cpf);
        if (existingPatient && existingPatient.patient_id !== id) {
            const error = new Error('O CPF fornecido já está registado noutro paciente.');
            error.statusCode = 409;
            throw error;
        }
    }
    if (patientData.cns && !isValidCNS(patientData.cns)) {
        throw new Error('O Cartão do SUS (CNS) fornecido é inválido.');
    }
    return patientModel.update(id, patientData);
};

exports.getPatientDetails = async (id) => {
    const patient = await patientModel.findByIdWithHistory(id);
    if (!patient) {
        const error = new Error('Paciente não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    return patient;
};
exports.deletePatient = async (id) => {
    const deletedCount = await patientModel.remove(id);
    if (deletedCount === 0) {
        const error = new Error('Paciente a ser apagado não encontrado.');
        error.statusCode = 404;
        throw error;
    }
};

// NOVA FUNÇÃO: Serviço para obter o histórico do paciente.
exports.getPatientHistory = async (patientId) => {
    // Primeiro, busca o paciente para garantir que ele existe.
    const patient = await patientModel.findById(patientId);
    if (!patient) {
        const error = new Error('Paciente não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    const history = await patientModel.findHistoryByPatientId(patientId);

    // Retorna os dados do paciente e o seu histórico.
    return {
        patient_id: patient.patient_id,
        name: patient.name,
        history: history
    };
};
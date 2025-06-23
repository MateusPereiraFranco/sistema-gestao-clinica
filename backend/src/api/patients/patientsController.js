const patientService = require('./patientsService');

// O controller agora extrai os filtros dos query parameters da URL.
exports.getAllPatients = async (req, res, next) => {
    try {
        // Ex: /api/patients?name=João&cpf=123
        const filters = req.query;
        const patients = await patientService.getAllPatients(filters);
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

exports.getPatientForEdit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patientData = await patientService.getPatientForEdit(id);
        res.status(200).json(patientData);
    } catch (error) {
        next(error);
    }
};

// ... (outras funções do controller permanecem as mesmas) ...
exports.createPatient = async (req, res, next) => {
    try {
        const newPatient = await patientService.createPatient(req.body, req.user.user_id);
        res.status(201).json(newPatient);
    } catch (error) {
        next(error);
    }
};
exports.getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patientDetails = await patientService.getPatientDetails(id);
        res.status(200).json(patientDetails);
    } catch (error) {
        next(error);
    }
};
exports.updatePatient = async (req, res, next) => {
    try {
        const updatedPatient = await patientService.updatePatient(req.params.id, req.body);
        res.status(200).json(updatedPatient);
    } catch (error) {
        next(error);
    }
};
exports.deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
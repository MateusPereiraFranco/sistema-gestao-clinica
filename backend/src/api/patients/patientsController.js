const patientService = require('./patientsService');
const patientModel = require('./patientsModel')
const auditLogModel = require('../auditLogs/auditLogModel');

exports.getAllPatients = async (req, res, next) => {
    try {
        const filters = req.query;
        const patients = await patientService.getAllPatients(filters, req.user);
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

exports.getPatientForEdit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patientData = await patientService.getPatientForEdit(id, req.user);
        res.status(200).json(patientData);
    } catch (error) {
        next(error);
    }
};


exports.createPatient = async (req, res, next) => {
    try {
        const newPatient = await patientService.createPatient(req.body, req.user.user_id, req.user.unit_id);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'CREATE_PATIENT',
            target_entity: 'patients',
            target_id: newPatient.patient_id,
            details: { ...newPatient }
        });
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
        const originalPatient = await patientModel.findById(req.params.id);
        const updatedPatient = await patientService.updatePatient(req.params.id, req.body, req.user);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'UPDATE_PATIENT',
            target_entity: 'patients',
            target_id: req.params.id,
            details: {
                before: originalPatient,
                after: updatedPatient
            }
        });
        res.status(200).json(updatedPatient);
    } catch (error) {
        next(error);
    }
};
exports.deletePatient = async (req, res, next) => {
    try {
        const patientToDelete = await patientModel.findById(req.params.id);
        await patientService.deletePatient(req.params.id);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'DELETE_PATIENT',
            target_entity: 'patients',
            target_id: req.params.id,
            details: {
                deleted_patient_name: patientToDelete.name,
                deleted_patient_cpf: patientToDelete.cpf
            }
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.getPatientHistory = async (req, res, next) => {
    try {
        const { startDate, endDate, professional_id, withScheduled } = req.query;
        const historyData = await patientService.getPatientHistory(req.params.id, { startDate, endDate, professional_id, withScheduled });
        res.status(200).json(historyData);
    } catch (error) {
        next(error);
    }
};
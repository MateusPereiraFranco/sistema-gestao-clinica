const { Router } = require('express');
const patientController = require('./patientsController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { checkUnitAccess } = require('../../middlewares/permissionMiddleware');

const router = Router();
router.use(protect);

router.route('/')
    .post(patientController.createPatient)
    .get(patientController.getAllPatients);

// NOVA ROTA: Rota dedicada para buscar o histórico de um paciente.
router.get('/:id/history', checkUnitAccess('patients'), patientController.getPatientHistory);

router.get('/:id/for-edit', checkUnitAccess('patients'), patientController.getPatientForEdit);

router.route('/:id')
    .get(checkUnitAccess('patients'), patientController.getPatientById)
    .put(checkUnitAccess('patients'), patientController.updatePatient)
    .delete(checkUnitAccess('patients'), restrictTo('master'), patientController.deletePatient);

module.exports = router;
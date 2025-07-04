const { Router } = require('express');
const patientController = require('./patientsController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect);

router.route('/')
    .post(patientController.createPatient)
    .get(patientController.getAllPatients);

// NOVA ROTA: Rota dedicada para buscar o histórico de um paciente.
router.get('/:id/history', patientController.getPatientHistory);

router.get('/:id/for-edit', patientController.getPatientForEdit);

router.route('/:id')
    .get(patientController.getPatientById)
    .put(patientController.updatePatient)
    .delete(restrictTo('master'), patientController.deletePatient);

module.exports = router;
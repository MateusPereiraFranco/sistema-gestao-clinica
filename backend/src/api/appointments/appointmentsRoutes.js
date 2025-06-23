const { Router } = require('express');
const appointmentController = require('./appointmentsController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect);

router.route('/')
    .get(appointmentController.getAppointments)
    .post(appointmentController.createAppointment);

// NOVAS ROTAS para gerir o ciclo de vida
router.patch('/:id/check-in', appointmentController.checkIn);
router.patch('/:id/mark-as-missed', appointmentController.markAsMissed);

module.exports = router;
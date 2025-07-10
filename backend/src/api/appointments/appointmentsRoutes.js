const { Router } = require('express');
const appointmentController = require('./appointmentsController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect);

router.route('/')
    .get(appointmentController.getAppointments)
    .post(appointmentController.createAppointment);

router.get('/:id/details-for-service', appointmentController.getServiceDetails);
router.post('/:id/complete-service', appointmentController.completeService);
router.get('/:id/view', appointmentController.getCompletedServiceForView);
router.post('/on-demand', appointmentController.createOnDemandService);
router.post('/waiting-list', appointmentController.addToWaitingList);

router.get('/check-waiting-list', appointmentController.checkWaitingList);
router.get('/check-future-schedule', appointmentController.checkFutureSchedule);
router.patch('/:id/schedule-from-waitlist', appointmentController.scheduleFromWaitlist);
router.patch('/:id/attend-from-waitlist', appointmentController.attendFromWaitlist);

router.patch('/:id/cancel', restrictTo('admin', 'master'), appointmentController.cancelAppointment);

// Rotas para gerir o ciclo de vida
router.patch('/:id/check-in', appointmentController.checkIn);
router.patch('/:id/mark-as-missed', appointmentController.markAsMissed);
// NOVA ROTA: Rota para o profissional iniciar o atendimento.
router.patch('/:id/start-service', appointmentController.startService);

module.exports = router;
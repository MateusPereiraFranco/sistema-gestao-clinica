const appointmentService = require('./appointmentsService');

/**
 * Controller para obter a agenda do dia do profissional autenticado.
 */
exports.getMyAgenda = async (req, res, next) => {
    try {
        // O ID do utilizador vem do token JWT, garantindo que ele só vê a sua própria agenda.
        const professionalId = req.user.user_id;
        const agenda = await appointmentService.getTodaysAgendaForProfessional(professionalId);
        res.status(200).json(agenda);
    } catch (error) {
        next(error);
    }
};

exports.getAppointments = async (req, res, next) => {
    try {
        // Ex: /api/appointments?professionalId=...&date=2025-06-22
        const { professionalId, date } = req.query;
        const appointments = await appointmentService.getAppointmentsByProfessionalAndDate(professionalId, date);
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const newAppointment = await appointmentService.createAppointment(req.body);
        res.status(201).json(newAppointment);
    } catch (error) {
        next(error);
    }
};

exports.checkIn = async (req, res, next) => {
    try {
        const updatedAppointment = await appointmentService.checkIn(req.params.id);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

exports.markAsMissed = async (req, res, next) => {
    try {
        const { isJustified, observation } = req.body;
        const updatedAppointment = await appointmentService.markAsMissed(req.params.id, isJustified, observation);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};
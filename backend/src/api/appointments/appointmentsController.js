const appointmentService = require('./appointmentsService');

exports.getAppointments = async (req, res, next) => {
    try {
        const { professionalId, date } = req.query;
        const appointments = await appointmentService.getAppointmentsByProfessionalAndDate(professionalId, date);
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        // CORREÇÃO: Garantir que estamos a chamar o serviço correto de agendamentos.
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
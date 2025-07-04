const appointmentService = require('./appointmentsService');

exports.getAppointments = async (req, res, next) => {
    try {
        const { professionalId, date, status, period } = req.query;
        const filters = {
            professionalId,
            date,
            statusArray: Array.isArray(status) ? status : (status ? [status] : []),
            period
        };
        const appointments = await appointmentService.getAppointments(filters);
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

exports.addToWaitingList = async (req, res, next) => {
    try {
        const newEntry = await appointmentService.addToWaitingList(req.body);
        res.status(201).json(newEntry);
    } catch (error) {
        next(error);
    }
};

exports.createOnDemandService = async (req, res, next) => {
    try {
        const newAppointment = await appointmentService.createOnDemandService(req.body);
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

exports.startService = async (req, res, next) => {
    try {
        // Passamos o ID do agendamento (dos parâmetros da URL) e o ID do utilizador logado (do token) para o serviço.
        const updatedAppointment = await appointmentService.startService(req.params.id, req.user.user_id);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

exports.getCompletedServiceForView = async (req, res, next) => {
    try {
        const details = await appointmentService.getCompletedServiceDetails(req.params.id);
        res.status(200).json(details);
    } catch (error) {
        next(error);
    }
};

exports.getServiceDetails = async (req, res, next) => {
    try {
        const details = await appointmentService.getServiceDetails(req.params.id);
        res.status(200).json(details);
    } catch (error) {
        next(error);
    }
};

exports.completeService = async (req, res, next) => {
    try {
        const result = await appointmentService.completeService(req.params.id, req.body, req.user.user_id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.checkWaitingList = async (req, res, next) => {
    try {
        const { patientId, professionalId } = req.query;
        const entry = await appointmentService.checkWaitingList(patientId, professionalId);
        res.status(200).json(entry || null);
    } catch (error) {
        next(error);
    }
};

// NOVO CONTROLLER
exports.scheduleFromWaitlist = async (req, res, next) => {
    try {
        const { newDateTime } = req.body;
        const updatedAppointment = await appointmentService.scheduleFromWaitlist(req.params.id, newDateTime);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

exports.attendFromWaitlist = async (req, res, next) => {
    try {
        const updatedAppointment = await appointmentService.attendFromWaitlist(req.params.id);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

exports.cancelAppointment = async (req, res, next) => {
    try {
        const updatedAppointment = await appointmentService.cancelAppointment(req.params.id);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};
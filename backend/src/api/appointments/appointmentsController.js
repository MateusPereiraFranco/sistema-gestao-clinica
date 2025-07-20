const appointmentService = require('./appointmentsService');
const appointmentModel = require('./appointmentsModel');
const auditLogModel = require('../auditLogs/auditLogModel');

exports.getAppointments = async (req, res, next) => {
    try {
        const { professionalId, date, period, startDate, endDate, includeInactive } = req.query;
        const status = req.query['status[]'] || req.query.status;

        const filters = {
            professionalId,
            date,
            statusArray: Array.isArray(status) ? status : (status ? [status] : []),
            period,
            startDate,
            endDate,
            includeInactive: includeInactive === 'true'
        };

        const appointments = await appointmentService.getAppointments(filters, req.user);
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const newAppointment = await appointmentService.createAppointment(req.body, req.user);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'CREATE_APPOINTMENT',
            target_entity: 'appointments',
            target_id: newAppointment.appointment_id,
            details: { ...newAppointment }
        });
        res.status(201).json(newAppointment);
    } catch (error) {
        next(error);
    }
};

exports.addToWaitingList = async (req, res, next) => {
    try {
        const newEntry = await appointmentService.addToWaitingList(req.body, req.user.user_id);
        res.status(201).json(newEntry);
    } catch (error) {
        next(error);
    }
};

exports.createOnDemandService = async (req, res, next) => {
    try {
        const newAppointment = await appointmentService.createOnDemandService(req.body);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'CREATE_APPOINTMENT_ON_DEMAND_SERVICE',
            target_entity: 'appointments',
            target_id: newAppointment.appointment_id,
            details: { ...newAppointment }
        });
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

exports.checkFutureSchedule = async (req, res, next) => {
    try {
        const { patientId, professional_id } = req.query;
        const entry = await appointmentService.checkFutureSchedule(patientId, professional_id);
        res.status(200).json(entry || null);
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
        const originalAppointment = await appointmentModel.findById(req.params.id);
        const updatedAppointment = await appointmentService.cancelAppointment(req.params.id);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'Cancel Appointments',
            target_entity: 'appointments',
            target_id: req.params.id,
            details: {
                before: originalAppointment,
                after: updatedAppointment
            }
        });
        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

exports.getDetailedReportAppointments = async (req, res, next) => {
    const { professionalId, date, period, startDate, endDate, includeInactive } = req.query;
    const status = req.query['statusArray[]'] || req.query.statusArray;

    const filters = {
        professionalId,
        date,
        statusArray: Array.isArray(status) ? status : (status ? [status] : []),
        period,
        startDate,
        endDate,
        includeInactive: includeInactive === 'true'
    };

    const detailedAppointments = await appointmentModel.findAppointments(filters, req.user);

    res.status(200).json({
        status: 'success',
        results: detailedAppointments.length,
        data: {
            appointments: detailedAppointments
        }
    });
};
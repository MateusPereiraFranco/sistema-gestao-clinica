const appointmentModel = require('./appointmentsModel');
const userModel = require('../users/usersModel');
const db = require('../../config/db');

exports.getAppointmentsByProfessionalAndDate = async (professionalId, date) => {
    if (!professionalId || !date) {
        const error = new Error('ID do profissional e data são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    return appointmentModel.findByProfessionalAndDate(professionalId, date);
};

exports.getAppointments = async (filters, user) => {
    if (user.profile !== 'admin') {
        if (!filters.professionalId || filters.professionalId === 'all') {
            filters.professionalId = 'all';
            filters.unit_id = user.unit_id;
            return appointmentModel.findAppointments(filters);
        }

        const professional = await userModel.findById(filters.professionalId);

        if (!professional || professional.unit_id !== user.unit_id) {
            return [];
        }
    }
    return appointmentModel.findAppointments(filters);
};

exports.createAppointment = async (appointmentData) => {
    const { professional_id, appointment_datetime, patient_id, observations, vinculo } = appointmentData;

    if (!professional_id || !appointment_datetime || !patient_id || !vinculo) {
        const error = new Error('Dados insuficientes para criar o agendamento.');
        error.statusCode = 400;
        throw error;
    }

    const existingAppointment = await appointmentModel.findByProfessionalAndDateTime(professional_id, appointment_datetime);
    if (existingAppointment) {
        const error = new Error('Este horário já está ocupado para o profissional selecionado.');
        error.statusCode = 409;
        throw error;
    }

    const professional = await userModel.findById(professional_id);
    if (!professional) {
        const error = new Error('Profissional não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (!professional.unit_id) {
        const error = new Error('O profissional selecionado não está associado a nenhuma unidade.');
        error.statusCode = 400;
        throw error;
    }

    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';

    const fullAppointmentData = {
        patient_id: patient_id,
        professional_id: professional_id,
        unit_id: professional.unit_id,
        appointment_datetime: appointment_datetime,
        service_type: specialtyName,
        observations: observations || null,
        status: 'scheduled',
        vinculo: vinculo,
        created_by: professional_id
    };

    return appointmentModel.create(fullAppointmentData);
};

exports.addToWaitingList = async (data, loggedInUserId) => {
    const { patient_id, professional_id, vinculo, request_date, observations } = data;
    if (!patient_id || !professional_id || !request_date) {
        throw new Error("Dados insuficientes para adicionar à lista de espera.");
    }

    const professional = await userModel.findById(professional_id);
    if (!professional) throw new Error('Profissional não encontrado.');

    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    const appointment_datetime = `${request_date}T${timeString}`;

    const appointmentData = {
        patient_id,
        professional_id,
        vinculo,
        unit_id: professional.unit_id,
        appointment_datetime,
        service_type: specialtyName,
        observations: observations || 'Adicionado à lista de espera.',
        status: 'on_waiting_list',
        created_by: loggedInUserId
    };

    return appointmentModel.create(appointmentData);
};

exports.checkIn = async (appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        const error = new Error('Agendamento não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    if (appointment.status !== 'scheduled' && appointment.status !== 'on_waiting_list') {
        throw new Error(`Não é possível fazer check-in de um agendamento com status '${appointment.status}'.`);
    }
    return appointmentModel.updateStatus(appointmentId, 'waiting');
};

exports.markAsMissed = async (appointmentId, isJustified, observation) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        const error = new Error('Agendamento não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    const newStatus = isJustified ? 'justified_absence' : 'unjustified_absence';
    return appointmentModel.updateStatus(appointmentId, newStatus, observation);
};

exports.startService = async (appointmentId, loggedInUserId) => {
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
        const error = new Error('Agendamento não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (appointment.professional_id !== loggedInUserId) {
        const loggedInUser = await userModel.findById(loggedInUserId);
        if (loggedInUser.profile !== 'admin') {
            const error = new Error('Você não tem permissão para atender este paciente.');
            error.statusCode = 403;
            throw error;
        }
    }

    if (appointment.status !== 'waiting' && appointment.status !== 'in_progress') {
        const error = new Error(`Não é possível iniciar um atendimento com status '${appointment.status}'.`);
        error.statusCode = 409;
        throw error;
    }

    if (appointment.status === 'in_progress') {
        return appointment;
    }

    return appointmentModel.updateStatus(appointmentId, 'in_progress');
};

exports.checkFutureSchedule = async (patientId, professional_id) => {
    return appointmentModel.findFutureScheduledAppointment(patientId, professional_id);
};


exports.getServiceDetails = async (appointmentId) => {
    const details = await appointmentModel.findDetailsForService(appointmentId);
    if (!details) throw new Error('Detalhes do atendimento não encontrados.');
    return details;
};

exports.completeService = async (appointmentId, data, loggedInUserId) => {
    const { evolution, referral_ids, discharge_given, follow_up_days } = data;

    const loggedInUser = await userModel.findById(loggedInUserId);
    if (!loggedInUser) {
        throw new Error("Utilizador autenticado não encontrado.");
    }

    if (loggedInUser.specialty_id) {
        const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [loggedInUser.specialty_id]);
        loggedInUser.specialty_name = specialtyResponse.rows[0]?.name;
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Agendamento não encontrado.");
    if (appointment.professional_id !== loggedInUserId) throw new Error("Não autorizado.");

    await db.query(
        'INSERT INTO medical_records (patient_id, professional_id, appointment_id, evolution) VALUES ($1, $2, $3, $4)',
        [appointment.patient_id, loggedInUserId, appointmentId, evolution]
    );

    if (referral_ids && referral_ids.length > 0) {
        for (const professionalId of referral_ids) {
            const existingEntry = await appointmentModel.findWaitingListEntry(appointment.patient_id, professionalId);
            if (!existingEntry) {
                const professional = await userModel.findById(professionalId);
                if (professional) {
                    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
                    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';
                    await appointmentModel.create({
                        patient_id: appointment.patient_id,
                        professional_id: professionalId,
                        unit_id: professional.unit_id,
                        appointment_datetime: new Date(),
                        service_type: specialtyName,
                        observations: `Encaminhado por Dr(a). ${loggedInUser.name} em ${new Date().toLocaleDateString('pt-BR')}`,
                        status: 'on_waiting_list',
                        vinculo: appointment.vinculo || 'nenhum',
                        created_by: loggedInUserId
                    });
                }
            }
        }
    }

    if (!discharge_given && follow_up_days && Number(follow_up_days) > 0) {
        await appointmentModel.create({
            patient_id: appointment.patient_id,
            professional_id: loggedInUserId,
            unit_id: loggedInUser.unit_id,
            appointment_datetime: new Date(),
            service_type: loggedInUser.specialty_name || 'Retorno',
            observations: `Retorno solicitado em ${follow_up_days} dias pelo(a) Dr(a) ${loggedInUser.name} em ${appointment.appointment_datetime.toLocaleDateString('pt-BR')}.`,
            status: 'on_waiting_list',
            vinculo: appointment.vinculo || 'nenhum',
            created_by: loggedInUserId,
        });
    }

    await appointmentModel.createReferrals(appointmentId, referral_ids);

    await appointmentModel.updateStatus(appointmentId, 'completed');

    await db.query(
        'UPDATE appointments SET discharge_given = $1, follow_up_days = $2 WHERE appointment_id = $3',
        [discharge_given, follow_up_days, appointmentId]
    );

    return { message: 'Atendimento finalizado com sucesso.' };
};

exports.createOnDemandService = async (data) => {
    const { patient_id, professional_id, vinculo } = data;
    if (!patient_id || !professional_id || !vinculo) {
        const error = new Error("ID do paciente e do profissional são obrigatórios.");
        error.statusCode = 400;
        throw error;
    }

    const professional = await userModel.findById(professional_id);
    if (!professional) {
        const error = new Error('Profissional não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (!professional.unit_id) {
        const error = new Error('O profissional selecionado não está associado a nenhuma unidade.');
        error.statusCode = 400;
        throw error;
    }

    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';

    const appointmentData = {
        patient_id,
        professional_id,
        unit_id: professional.unit_id,
        appointment_datetime: null,
        service_type: specialtyName,
        observations: 'Atendimento avulso (gerado)',
        status: 'waiting',
        vinculo: vinculo,
        created_by: professional_id
    };

    return appointmentModel.create(appointmentData);
};

exports.getCompletedServiceDetails = async (appointmentId) => {
    const details = await appointmentModel.findCompletedServiceDetails(appointmentId);
    if (!details) {
        const error = new Error('Detalhes do atendimento concluído não encontrados.');
        error.statusCode = 404;
        throw error;
    }
    return details;
};

exports.checkWaitingList = async (patientId, professionalId) => {
    return appointmentModel.findWaitingListEntry(patientId, professionalId);
};

exports.scheduleFromWaitlist = async (appointmentId, newDateTime) => {
    return appointmentModel.updateFromWaitingListToScheduled(appointmentId, newDateTime);
};

exports.attendFromWaitlist = async (appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.status !== 'on_waiting_list') {
        throw new Error("Agendamento na lista de espera não encontrado.");
    }
    return appointmentModel.updateFromWaitingListToInProgress(appointmentId);
};

exports.cancelAppointment = async (appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        const error = new Error('Agendamento não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (appointment.status === 'completed') {
        const error = new Error('Não é possível cancelar um atendimento que já foi concluído.');
        error.statusCode = 409;
        throw error;
    }

    return appointmentModel.updateStatus(appointmentId, 'canceled');
};
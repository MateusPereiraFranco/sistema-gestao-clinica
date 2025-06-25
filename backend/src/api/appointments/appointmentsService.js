const appointmentModel = require('./appointmentsModel');
const userModel = require('../users/usersModel');
const db = require('../../config/db'); // <-- CORREÇÃO: Importação adicionada

exports.getAppointmentsByProfessionalAndDate = async (professionalId, date) => {
    if (!professionalId || !date) {
        const error = new Error('ID do profissional e data são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    return appointmentModel.findByProfessionalAndDate(professionalId, date);
};

exports.createAppointment = async (appointmentData) => {
    const { professional_id, appointment_datetime, patient_id, observations } = appointmentData;

    if (!professional_id || !appointment_datetime || !patient_id) {
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

    // Busca os dados da especialidade do profissional para usar no agendamento.
    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';

    const fullAppointmentData = {
        patient_id: patient_id,
        professional_id: professional_id,
        unit_id: professional.unit_id,
        appointment_datetime: appointment_datetime,
        service_type: specialtyName,
        observations: observations || null,
    };

    return appointmentModel.create(fullAppointmentData);
};

exports.checkIn = async (appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        const error = new Error('Agendamento não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    if (appointment.status !== 'scheduled') {
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

    // VALIDAÇÃO DE POSSE: O ID do utilizador logado tem de ser igual ao do profissional do agendamento.
    if (appointment.professional_id !== loggedInUserId) {
        const error = new Error('Você não tem permissão para atender este paciente.');
        error.statusCode = 403; // 403 Forbidden
        throw error;
    }

    // VALIDAÇÃO DE ESTADO: Só se pode atender um paciente que está na sala de espera.
    if (appointment.status !== 'waiting') {
        const error = new Error(`Não é possível iniciar um atendimento com status '${appointment.status}'.`);
        error.statusCode = 409; // 409 Conflict
        throw error;
    }

    return appointmentModel.updateStatus(appointmentId, 'in_progress');
};

exports.getServiceDetails = async (appointmentId) => {
    const details = await appointmentModel.findDetailsForService(appointmentId);
    if (!details) throw new Error('Detalhes do atendimento não encontrados.');
    return details;
};

exports.completeService = async (appointmentId, data, loggedInUserId) => {
    const { evolution, referral_ids, discharge_given, follow_up_days } = data;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Agendamento não encontrado.");
    if (appointment.professional_id !== loggedInUserId) throw new Error("Não autorizado.");

    // Regra de negócio: Atualiza a evolução na tabela de registos médicos (medical_records)
    await db.query(
        'INSERT INTO medical_records (patient_id, professional_id, appointment_id, evolution) VALUES ($1, $2, $3, $4)',
        [appointment.patient_id, loggedInUserId, appointmentId, evolution]
    );

    // Regra de negócio: Cria os encaminhamentos
    await appointmentModel.createReferrals(appointmentId, referral_ids);

    // Regra de negócio: Atualiza o status do agendamento original
    await appointmentModel.updateStatus(appointmentId, 'completed');

    // Atualiza a própria tabela de agendamentos com o resultado
    await db.query(
        'UPDATE appointments SET discharge_given = $1, follow_up_days = $2 WHERE appointment_id = $3',
        [discharge_given, follow_up_days, appointmentId]
    );

    return { message: 'Atendimento finalizado com sucesso.' };
};
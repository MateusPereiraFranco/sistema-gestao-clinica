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
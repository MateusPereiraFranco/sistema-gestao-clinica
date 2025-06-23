const appointmentModel = require('./appointmentsModel');
const userModel = require('../users/usersModel');

/**
 * Obtém a agenda do dia para um profissional.
 * @param {string} professionalId - O UUID do profissional.
 */
exports.getTodaysAgendaForProfessional = async (professionalId) => {
    return appointmentModel.findTodaysByProfessionalId(professionalId);
};

exports.getAppointmentsByProfessionalAndDate = async (professionalId, date) => {
    if (!professionalId || !date) {
        const error = new Error('ID do profissional e data são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    return appointmentModel.findByProfessionalAndDate(professionalId, date);
};

exports.createAppointment = async (appointmentData) => {
    const { professional_id, appointment_datetime, patient_id, observations } = appointmentData; // observações é opcional

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

    const fullAppointmentData = {
        ...appointmentData,
        unit_id: professional.unit_id,
        service_type: professional.specialty_name || 'Atendimento Geral',
        observations: observations || null, // Garante que é nulo se não for fornecido
    };

    return appointmentModel.create(fullAppointmentData);
};

exports.checkIn = async (appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error('Agendamento não encontrado.');
    if (appointment.status !== 'scheduled') {
        throw new Error(`Não é possível fazer check-in de um agendamento com status '${appointment.status}'.`);
    }
    return appointmentModel.updateStatus(appointmentId, 'waiting');
};

exports.markAsMissed = async (appointmentId, isJustified, observation) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error('Agendamento não encontrado.');
    const newStatus = isJustified ? 'justified_absence' : 'unjustified_absence';
    return appointmentModel.updateStatus(appointmentId, newStatus, observation);
};
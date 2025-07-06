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

exports.getAppointments = async (filters) => {
    return appointmentModel.findAppointments(filters);
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
        status: 'scheduled'
    };

    return appointmentModel.create(fullAppointmentData);
};

exports.addToWaitingList = async (data) => {
    const { patient_id, professional_id, request_date } = data;
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
        unit_id: professional.unit_id,
        appointment_datetime,
        service_type: specialtyName,
        observations: 'Adicionado à lista de espera.',
        status: 'on_waiting_list' // O novo status!
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
        if (loggedInUser.profile !== 'master') {
            const error = new Error('Você não tem permissão para atender este paciente.');
            error.statusCode = 403; // 403 Forbidden
            throw error;
        }
    }

    // CORREÇÃO: A validação agora permite continuar um atendimento que já está em progresso.
    if (appointment.status !== 'waiting' && appointment.status !== 'in_progress') {
        const error = new Error(`Não é possível iniciar um atendimento com status '${appointment.status}'.`);
        error.statusCode = 409; // 409 Conflict
        throw error;
    }

    // Se o status já for 'in_progress', não há necessidade de o atualizar novamente.
    // Simplesmente permitimos que o fluxo continue.
    if (appointment.status === 'in_progress') {
        return appointment;
    }

    // Se o status for 'waiting', atualiza para 'in_progress'.
    return appointmentModel.updateStatus(appointmentId, 'in_progress');
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

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Agendamento não encontrado.");
    if (appointment.professional_id !== loggedInUserId) throw new Error("Não autorizado.");

    // Regra de negócio: Atualiza a evolução na tabela de registos médicos (medical_records)
    await db.query(
        'INSERT INTO medical_records (patient_id, professional_id, appointment_id, evolution) VALUES ($1, $2, $3, $4)',
        [appointment.patient_id, loggedInUserId, appointmentId, evolution]
    );

    if (referral_ids && referral_ids.length > 0) {
        for (const professionalId of referral_ids) {
            // Verifica se o paciente já está na lista de espera para este profissional
            const existingEntry = await appointmentModel.findWaitingListEntry(appointment.patient_id, professionalId);

            // Se não estiver, cria a nova entrada na lista de espera
            if (!existingEntry) {
                const professional = await userModel.findById(professionalId);
                if (professional) {
                    const specialtyResponse = await db.query('SELECT name FROM specialties WHERE specialty_id = $1', [professional.specialty_id]);
                    const specialtyName = specialtyResponse.rows[0]?.name || 'Atendimento Geral';
                    await appointmentModel.create({
                        patient_id: appointment.patient_id,
                        professional_id: professionalId,
                        unit_id: professional.unit_id,
                        appointment_datetime: new Date(), // A data da solicitação é hoje
                        service_type: specialtyName,
                        observations: `Encaminhado por Dr(a). ${loggedInUser.name} em ${new Date().toLocaleDateString('pt-BR')}`,
                        status: 'on_waiting_list'
                    });
                }
            }
        }
    }

    // 4. LÓGICA DE NEGÓCIO: Se houver um retorno, cria uma nova entrada na lista de espera.
    if (!discharge_given && follow_up_days && Number(follow_up_days) > 0) {
        // Calcula a data do retorno
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + Number(follow_up_days));

        // Cria a nova entrada na lista de espera para o mesmo profissional
        await appointmentModel.create({
            patient_id: appointment.patient_id,
            professional_id: loggedInUserId,
            unit_id: loggedInUser.unit_id,
            appointment_datetime: returnDate,
            service_type: loggedInUser.specialty_name || 'Retorno',
            observations: `Retorno solicitado em ${follow_up_days} dias pelo(a) Dr(a). ${loggedInUser.name}.`,
            status: 'on_waiting_list'
        });
    }

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

exports.createOnDemandService = async (data) => {
    const { patient_id, professional_id } = data;
    if (!patient_id || !professional_id) {
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
        // CORREÇÃO: Não geramos mais a data aqui. Deixamos a base de dados fazer isso.
        appointment_datetime: null,
        service_type: specialtyName,
        observations: 'Atendimento avulso (gerado na receção)',
        status: 'waiting'
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

// NOVO SERVIÇO: Para verificar a lista de espera.
exports.checkWaitingList = async (patientId, professionalId) => {
    return appointmentModel.findWaitingListEntry(patientId, professionalId);
};

// NOVO SERVIÇO: Para agendar a partir da lista de espera.
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

    // Regra de negócio: Não se pode cancelar um atendimento já concluído.
    if (appointment.status === 'completed') {
        const error = new Error('Não é possível cancelar um atendimento que já foi concluído.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    return appointmentModel.updateStatus(appointmentId, 'canceled');
};
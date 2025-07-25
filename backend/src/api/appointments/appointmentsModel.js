const db = require('../../config/db');
const { addMonths, addDays, isBefore, format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');

exports.findByProfessionalAndDate = async (professionalId, date) => {
    const query = `
        SELECT
            apt.appointment_id,
            apt.professional_id,
            apt.appointment_datetime,
            to_char(apt.appointment_datetime, 'HH24:MI') as time,
            apt.service_type,
            apt.status,
            apt.observations,
            apt.vinculo,
            p.patient_id,
            p.name as patient_name,
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        WHERE apt.professional_id = $1 AND apt.appointment_datetime::date = $2::date
        ORDER BY apt.appointment_datetime ASC;
    `;
    const { rows } = await db.query(query, [professionalId, date]);
    return rows;
};

exports.findAppointments = async (filters) => {
    const { professionalId, date, statusArray, period, unit_id, startDate, endDate, includeInactive } = filters;
    let query = `
        SELECT
            apt.appointment_id, apt.professional_id, apt.appointment_datetime,
            to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') as time,
            to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as date_formatted,
            apt.service_type, apt.status, apt.observations, apt.vinculo, apt.recurring_group_id,
            p.patient_id, p.name as patient_name, p.cpf as patient_cpf, p.cns as patient_cns, 
            to_char(p.birth_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as patient_birth_date,
            p.mother_name as patient_mother_name,
            prof.name as professional_name
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        JOIN users prof ON apt.professional_id = prof.user_id
        WHERE 1=1 
    `;
    const params = [];
    let paramIndex = 1;

    if (date) {
        query += ` AND apt.appointment_datetime::date = $${paramIndex++}::date`;
        params.push(date);
    }
    if (startDate && endDate) {
        query += ` AND apt.appointment_datetime::date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(startDate, endDate);
    }
    if (professionalId && professionalId !== 'all') {
        query += ` AND apt.professional_id = $${paramIndex++}`;
        params.push(professionalId);
    }
    if (statusArray && statusArray.length > 0) {
        query += ` AND apt.status = ANY($${paramIndex++}::appointment_status[])`;
        params.push(statusArray);
    }
    if (unit_id && unit_id !== 'all') {
        query += ` AND apt.unit_id = $${paramIndex++}`;
        params.push(unit_id);
    }
    if (period === 'manha') {
        query += ` AND to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'HH24MI') < '1200'`;
    } else if (period === 'tarde') {
        query += ` AND to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'HH24MI') >= '1200'`;
    }
    if (!includeInactive) {
        query += ` AND prof.is_active = $${paramIndex++}`;
        params.push('true');
    }

    query += ' ORDER BY apt.appointment_datetime ASC;';
    const { rows } = await db.query(query, params);
    return rows;
};

exports.createReferrals = async (fromAppointmentId, professionalIds) => {
    if (!professionalIds || professionalIds.length === 0) return;

    let query = 'INSERT INTO referrals (from_appointment_id, referred_to_professional_id) VALUES ';
    const params = [];
    let paramIndex = 1;

    professionalIds.forEach((id, index) => {
        query += `($${paramIndex++}, $${paramIndex++})`;
        params.push(fromAppointmentId, id);
        if (index < professionalIds.length - 1) {
            query += ', ';
        }
    });

    await db.query(query, params);
};

exports.findFutureScheduledAppointment = async (patientId, professional_id) => {
    const query = `
        SELECT 
            appointment_id, 
            appointment_datetime,
            to_char(appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as formatted_date
        FROM appointments 
        WHERE 
            patient_id = $1
            AND professional_id = $2 
            AND status = 'scheduled' 
            AND appointment_datetime >= NOW()
        ORDER BY 
            appointment_datetime ASC
        LIMIT 1;
    `;
    const { rows } = await db.query(query, [patientId, professional_id]);
    return rows[0];
};

exports.findDetailsForService = async (appointmentId) => {
    const query = `
        SELECT
            p.patient_id,
            p.name as patient_name,
            to_char(p.birth_date, 'DD/MM/YYYY') as patient_birth_date,
            p.cpf as patient_cpf,
            p.cns as patient_cns, -- Adicionado
            p.mother_name as patient_mother_name,
            apt.appointment_id,
            apt.professional_id,
            apt.appointment_datetime -- Adicionado
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        WHERE apt.appointment_id = $1;
    `;
    const { rows } = await db.query(query, [appointmentId]);
    return rows[0];
};

exports.findCompletedServiceDetails = async (appointmentId) => {
    const appointmentQuery = `
        SELECT
            p.name as patient_name,
            to_char(p.birth_date, 'DD/MM/YYYY') as patient_birth_date,
            p.cpf as patient_cpf,
            p.cns as patient_cns,
            p.mother_name as patient_mother_name,
            apt.appointment_id,
            apt.observations,
            apt.discharge_given,
            apt.follow_up_days,
            apt.appointment_datetime,
            u.name as professional_name,
            s.name as specialty_name
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        JOIN users u ON apt.professional_id = u.user_id
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        WHERE apt.appointment_id = $1 AND apt.status = 'completed';
    `;
    const evolutionQuery = 'SELECT evolution FROM medical_records WHERE appointment_id = $1 ORDER BY record_datetime DESC LIMIT 1;';
    const referralsQuery = `
        SELECT u.name, s.name as specialty_name 
        FROM referrals r 
        JOIN users u ON r.referred_to_professional_id = u.user_id 
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        WHERE r.from_appointment_id = $1;
    `;

    const appointmentResult = await db.query(appointmentQuery, [appointmentId]);
    if (appointmentResult.rows.length === 0) return null;

    const evolutionResult = await db.query(evolutionQuery, [appointmentId]);
    const referralsResult = await db.query(referralsQuery, [appointmentId]);

    return {
        ...appointmentResult.rows[0],
        evolution: evolutionResult.rows[0]?.evolution || 'Nenhuma evolução registada.',
        referrals: referralsResult.rows,
    };
};

exports.create = async ({ patient_id, professional_id, unit_id, appointment_datetime, service_type, observations, status, created_by, vinculo }) => {
    const query = `
        INSERT INTO appointments (
            patient_id, professional_id, unit_id, 
            appointment_datetime, 
            service_type, status, observations, created_by, vinculo
        )
        VALUES ($1, $2, $3, COALESCE($4, NOW()), $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const params = [
        patient_id, professional_id, unit_id,
        appointment_datetime,
        service_type,
        status || 'scheduled',
        observations,
        created_by,
        vinculo
    ];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.updateStatus = async (id, status, observations) => {
    let query = 'UPDATE appointments SET status = $1';
    const params = [status, id];
    if (observations !== undefined) {
        query += ', observations = $2 WHERE appointment_id = $3 RETURNING *;';
        params.splice(1, 0, observations);
    } else {
        query += ' WHERE appointment_id = $2 RETURNING *;';
    }
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM appointments WHERE appointment_id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findByProfessionalAndDateTime = async (professionalId, dateTime) => {
    const query = 'SELECT appointment_id FROM appointments WHERE professional_id = $1 AND appointment_datetime = $2';
    const { rows } = await db.query(query, [professionalId, dateTime]);
    return rows[0];
};

exports.findWaitingListEntry = async (patientId, professionalId) => {
    const query = `
        SELECT 
            apt.*, 
            to_char(apt.appointment_datetime, 'DD/MM/YYYY') as request_date,
            creator.name as created_by_name
        FROM appointments apt
        LEFT JOIN users creator ON apt.created_by = creator.user_id
        WHERE apt.patient_id = $1 AND apt.professional_id = $2 AND apt.status = 'on_waiting_list'
        LIMIT 1;
    `;
    const { rows } = await db.query(query, [patientId, professionalId]);
    return rows[0];
};

exports.updateFromWaitingListToScheduled = async (appointmentId, newDateTime) => {
    const query = `
        UPDATE appointments 
        SET status = 'scheduled', appointment_datetime = $1
        WHERE appointment_id = $2
        RETURNING *;
    `;
    const { rows } = await db.query(query, [newDateTime, appointmentId]);
    return rows[0];
};

exports.updateFromWaitingListToInProgress = async (appointmentId) => {
    const query = `
        UPDATE appointments 
        SET status = 'waiting', appointment_datetime = NOW() 
        WHERE appointment_id = $1 
        RETURNING *;
    `;
    const { rows } = await db.query(query, [appointmentId]);
    return rows[0];
};

exports.createRecurring = async (baseAppointment, durationInMonths) => {
    // 1. Busca o unit_id do profissional para garantir que temos o valor correto
    const professionalQuery = 'SELECT unit_id FROM users WHERE user_id = $1';
    const { rows: professionalRows } = await db.query(professionalQuery, [baseAppointment.professional_id]);

    if (professionalRows.length === 0) {
        throw new Error('Profissional não encontrado para criar agendamentos recorrentes.');
    }
    const professionalUnitId = professionalRows[0].unit_id;
    if (!professionalUnitId) {
        const error = new Error('O profissional selecionado não está associado a uma unidade.');
        error.statusCode = 400;
        throw error;
    }

    const startDate = new Date(baseAppointment.appointment_datetime);
    const endDate = addMonths(startDate, durationInMonths);

    const appointmentDates = [];
    // Começa a calcular a partir da semana seguinte para evitar conflito com o dia atual.
    let currentDate = addDays(startDate, 7);

    while (isBefore(currentDate, endDate)) {
        appointmentDates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 7);
    }

    if (appointmentDates.length === 0) {
        return [];
    }

    const conflictCheckQuery = `
        SELECT to_char(appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as formatted_datetime 
        FROM appointments 
        WHERE professional_id = $1 
        AND status IN ('scheduled', 'waiting', 'in_progress')
        AND appointment_datetime = ANY($2::timestamptz[])
    `;
    const { rows: conflicts } = await db.query(conflictCheckQuery, [baseAppointment.professional_id, appointmentDates]);

    if (conflicts.length > 0) {
        const conflictTimes = conflicts.map(c => c.formatted_datetime).join(', ');
        const error = new Error(`Não foi possível criar a série. Os seguintes horários já estão ocupados: ${conflictTimes}`);
        error.statusCode = 409;
        throw error;
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const recurring_group_id = uuidv4();
        const createdAppointments = [];

        for (const date of appointmentDates) {
            const query = `
                INSERT INTO appointments (
                    patient_id, professional_id, unit_id, appointment_datetime, 
                    service_type, status, observations, created_by, vinculo, recurring_group_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *;
            `;
            const params = [
                baseAppointment.patient_id,
                baseAppointment.professional_id,
                professionalUnitId, // 2. Usa o unit_id que buscámos, em vez do que veio do frontend
                date,
                baseAppointment.service_type,
                'scheduled',
                baseAppointment.observations,
                baseAppointment.created_by,
                baseAppointment.vinculo,
                recurring_group_id
            ];

            const { rows } = await client.query(query, params);
            createdAppointments.push(rows[0]);
        }

        await client.query('COMMIT');
        return createdAppointments;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.deleteByGroupId = async (groupId) => {
    const query = `
        DELETE FROM appointments 
        WHERE recurring_group_id = $1 
        AND appointment_datetime >= NOW();
    `;
    const result = await db.query(query, [groupId]);
    return result.rowCount;
};
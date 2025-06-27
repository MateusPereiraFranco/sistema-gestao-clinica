const db = require('../../config/db');

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
            p.patient_id,
            p.name as patient_name,
            p.vinculo
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        WHERE apt.professional_id = $1 AND apt.appointment_datetime::date = $2::date
        ORDER BY apt.appointment_datetime ASC;
    `;
    const { rows } = await db.query(query, [professionalId, date]);
    return rows;
};

exports.findAppointments = async (filters) => {
    const { professionalId, date, statusArray } = filters;

    let query = `
        SELECT
            apt.appointment_id, apt.professional_id, apt.appointment_datetime,
            to_char(apt.appointment_datetime, 'HH24:MI') as time,
            apt.service_type, apt.status, apt.observations,
            p.patient_id, p.name as patient_name, p.vinculo,
            prof.name as professional_name -- Adiciona o nome do profissional
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
    // O filtro por profissional só é adicionado se um ID for fornecido.
    if (professionalId) {
        query += ` AND apt.professional_id = $${paramIndex++}`;
        params.push(professionalId);
    }
    if (statusArray && statusArray.length > 0) {
        query += ` AND apt.status = ANY($${paramIndex++}::appointment_status[])`;
        params.push(statusArray);
    }

    query += ' ORDER BY apt.appointment_datetime ASC;';

    const { rows } = await db.query(query, params);
    return rows;
};

exports.findByProfessionalAndDateTime = async (professionalId, dateTime) => {
    const query = 'SELECT appointment_id FROM appointments WHERE professional_id = $1 AND appointment_datetime = $2';
    const { rows } = await db.query(query, [professionalId, dateTime]);
    return rows[0];
};

// NOVA FUNÇÃO: Insere múltiplos encaminhamentos de uma vez.
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

exports.findDetailsForService = async (appointmentId) => {
    const query = `
        SELECT
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
    const query = `
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
    const appointmentResult = await db.query(query, [appointmentId]);
    if (appointmentResult.rows.length === 0) return null;

    const evolutionQuery = 'SELECT evolution FROM medical_records WHERE appointment_id = $1 ORDER BY record_datetime DESC LIMIT 1;';
    const referralsQuery = `
        SELECT u.name, s.name as specialty_name 
        FROM referrals r 
        JOIN users u ON r.referred_to_professional_id = u.user_id 
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        WHERE r.from_appointment_id = $1;
    `;

    const evolutionResult = await db.query(evolutionQuery, [appointmentId]);
    const referralsResult = await db.query(referralsQuery, [appointmentId]);

    return {
        ...appointmentResult.rows[0],
        evolution: evolutionResult.rows[0]?.evolution || 'Nenhuma evolução registada.',
        referrals: referralsResult.rows,
    };
};

exports.create = async ({ patient_id, professional_id, unit_id, appointment_datetime, service_type, observations, status }) => {
    const query = `INSERT INTO appointments (patient_id, professional_id, unit_id, appointment_datetime, service_type, status, observations) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const params = [patient_id, professional_id, unit_id, appointment_datetime, service_type, status || 'scheduled', observations];
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
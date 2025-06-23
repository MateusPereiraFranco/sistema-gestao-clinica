const db = require('../../config/db');

/**
 * Busca os agendamentos de hoje para um profissional específico.
 * @param {string} professionalId - O UUID do profissional.
 * @returns {Promise<any[]>} Uma lista de agendamentos.
 */
exports.findTodaysByProfessionalId = async (professionalId) => {
    const query = `
        SELECT
            apt.appointment_id,
            apt.appointment_datetime,
            apt.service_type,
            apt.status,
            p.patient_id,
            p.name as patient_name,
            p.photo_url
        FROM
            appointments apt
        JOIN
            patients p ON apt.patient_id = p.patient_id
        WHERE
            apt.professional_id = $1
            AND apt.appointment_datetime::date = CURRENT_DATE
        ORDER BY
            apt.appointment_datetime ASC;
    `;
    const { rows } = await db.query(query, [professionalId]);
    return rows;
};

exports.findByProfessionalAndDate = async (professionalId, date) => {
    const query = `
        SELECT
            apt.appointment_id,
            apt.appointment_datetime,
            to_char(apt.appointment_datetime, 'HH24:MI') as time,
            apt.service_type,
            apt.status,
            apt.observations,
            p.patient_id,
            p.name as patient_name
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        WHERE apt.professional_id = $1 AND apt.appointment_datetime::date = $2::date
        ORDER BY apt.appointment_datetime ASC;
    `;
    const { rows } = await db.query(query, [professionalId, date]);
    return rows;
};

exports.findByProfessionalAndDateTime = async (professionalId, dateTime) => {
    const query = 'SELECT appointment_id FROM appointments WHERE professional_id = $1 AND appointment_datetime = $2';
    const { rows } = await db.query(query, [professionalId, dateTime]);
    return rows[0];
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM appointments WHERE appointment_id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.create = async ({ patient_id, professional_id, unit_id, appointment_datetime, service_type, observations }) => {
    const query = `
        INSERT INTO appointments (patient_id, professional_id, unit_id, appointment_datetime, service_type, status, observations)
        VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
        RETURNING *;
    `;
    const params = [patient_id, professional_id, unit_id, appointment_datetime, service_type, observations];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.updateStatus = async (id, status, observations) => {
    // Constrói a query dinamicamente para só atualizar as observações se elas forem fornecidas.
    let query = 'UPDATE appointments SET status = $1';
    const params = [status, id];

    if (observations !== undefined) {
        query += ', observations = $2 WHERE appointment_id = $3 RETURNING *;';
        params.splice(1, 0, observations); // Insere as observações no array de parâmetros
    } else {
        query += ' WHERE appointment_id = $2 RETURNING *;';
    }

    const { rows } = await db.query(query, params);
    return rows[0];
};
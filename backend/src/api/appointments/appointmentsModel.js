const db = require('../../config/db');

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
            p.name as patient_name,
            p.vinculo
        FROM appointments apt
        JOIN patients p ON apt.patient_id = p.patient_id
        WHERE apt.professional_id = $1 AND apt.appointment_datetime::date = $2::date
        ORDER BY apt.appointment_datetime ASC;
    `;
    const { rows } = await db.query(query, [professionalId, date]);
    // CORREÇÃO: Deve retornar a lista completa de agendamentos, e não apenas o primeiro.
    return rows;
};

exports.findByProfessionalAndDateTime = async (professionalId, dateTime) => {
    const query = 'SELECT appointment_id FROM appointments WHERE professional_id = $1 AND appointment_datetime = $2';
    const { rows } = await db.query(query, [professionalId, dateTime]);
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
const db = require('../../config/db');
const { hashPassword } = require('../../utils/passwordUtil');

exports.findWithFilters = async (filters) => {
    let baseQuery = `
        SELECT patient_id, name, cpf, mother_name, to_char(birth_date, 'DD/MM/YYYY') as birth_date_formatted,unit_id,
               cell_phone_1, cell_phone_2, cns, cep, street, "number", neighborhood, city, state, unit_id
        FROM patients
    `;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.name) {
        conditions.push(`unaccent(name) ILIKE unaccent($${paramIndex++})`);
        params.push(`%${filters.name}%`);
    }
    if (filters.mother_name) {
        conditions.push(`unaccent(mother_name) ILIKE unaccent($${paramIndex++})`);
        params.push(`%${filters.mother_name}%`);
    }
    if (filters.father_name) {
        conditions.push(`unaccent(father_name) ILIKE unaccent($${paramIndex++})`);
        params.push(`%${filters.father_name}%`);
    }
    if (filters.cpf) {
        conditions.push(`cpf = $${paramIndex++}`);
        params.push(filters.cpf);
    }
    if (filters.cns) {
        conditions.push(`cns = $${paramIndex++}`);
        params.push(filters.cns);
    }
    if (filters.birth_date) {
        conditions.push(`birth_date = $${paramIndex++}`);
        params.push(filters.birth_date);
    }
    if (filters.unitId) {
        conditions.push(`unit_id = $${paramIndex++}`);
        params.push(filters.unitId);
    }

    if (conditions.length === 0) return [];

    baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    baseQuery += ' ORDER BY name LIMIT 10;';
    const { rows } = await db.query(baseQuery, params);
    return rows;
};

exports.create = async (patientData) => {
    const {
        name, mother_name, father_name, cpf, cns, birth_date,
        cell_phone_1, cell_phone_2, cep, street, number, neighborhood,
        city, state, observations, registered_by, unit_id
    } = patientData;

    const query = `
        INSERT INTO patients (
            name, mother_name, father_name, cpf, cns, birth_date, cell_phone_1, 
            cell_phone_2, cep, street, "number", neighborhood, city, state, 
            observations, registered_by, unit_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *;
    `;
    const params = [
        name, mother_name, father_name, cpf, cns, birth_date, cell_phone_1,
        cell_phone_2, cep, street, number, neighborhood, city, state,
        observations, registered_by, unit_id
    ];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.update = async (id, patientData, unit_id) => {
    const {
        name, mother_name, father_name, cpf, cns, birth_date,
        cell_phone_1, cell_phone_2, cep, street, number, neighborhood,
        city, state, observations
    } = patientData;

    const query = `
        UPDATE patients
        SET 
            name = $1, mother_name = $2, father_name = $3, cpf = $4, cns = $5, 
            birth_date = $6, cell_phone_1 = $7, cell_phone_2 = $8, cep = $9, 
            street = $10, "number" = $11, neighborhood = $12, city = $13, 
            state = $14, observations = $15, unit_id = $16, updated_at = NOW()
        WHERE patient_id = $17
        RETURNING *;
    `;
    const params = [
        name, mother_name, father_name, cpf, cns, birth_date,
        cell_phone_1, cell_phone_2, cep, street, number, neighborhood,
        city, state, observations, unit_id,
        id
    ];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.findByCpf = async (cpf) => {
    const query = 'SELECT patient_id FROM patients WHERE cpf = $1;';
    const { rows } = await db.query(query, [cpf]);
    return rows[0];
};

exports.findByCns = async (cns) => {
    const query = 'SELECT patient_id FROM patients WHERE cns = $1;';
    const { rows } = await db.query(query, [cns]);
    return rows[0];
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM patients WHERE patient_id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findByIdWithHistory = async (id) => {
    const patientQuery = 'SELECT * FROM patients WHERE patient_id = $1';
    const historyQuery = `
        SELECT r.record_id, r.record_datetime, r.evolution, u.name as professional_name, u.specialty
        FROM medical_records r
        JOIN users u ON r.professional_id = u.user_id
        WHERE r.patient_id = $1
        ORDER BY r.record_datetime DESC;
    `;
    const patientRes = await db.query(patientQuery, [id]);
    if (patientRes.rows.length === 0) return null;
    const historyRes = await db.query(historyQuery, [id]);
    return { ...patientRes.rows[0], history: historyRes.rows };
};

exports.findByIdForEdit = async (id) => {
    const query = `
        SELECT 
            patient_id, name, cpf, mother_name, father_name, cns,
            to_char(birth_date, 'YYYY-MM-DD') as birth_date,
            cell_phone_1, cell_phone_2, cep, street, "number",
            neighborhood, city, state, observations, unit_id
        FROM patients 
        WHERE patient_id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.remove = async (id) => {
    const { rowCount } = await db.query('DELETE FROM patients WHERE patient_id = $1;', [id]);
    return rowCount;
};

exports.findHistoryByPatientId = async (patientId, startDate, endDate, professional_id, withScheduled) => {
    let query = `
        SELECT
            apt.appointment_id,
            to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as date,
            to_char(apt.appointment_datetime AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') as time,
            apt.service_type,
            apt.status,
            apt.vinculo,
            apt.observations,
            u.name as professional_name
        FROM appointments apt
        JOIN users u ON apt.professional_id = u.user_id
        WHERE apt.patient_id = $1
    `;
    const params = [patientId];
    let paramIndex = 2;

    if (startDate && endDate) {
        query += ` AND apt.appointment_datetime::date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(startDate, endDate);
    }
    if (professional_id !== 'all') {
        query += ` AND apt.professional_id = $${paramIndex++}`;
        params.push(professional_id);
    }
    if (withScheduled === 'false') {
        query += ` AND apt.status != 'scheduled'`;
    }

    query += ' ORDER BY apt.appointment_datetime DESC;';

    const { rows } = await db.query(query, params);
    return rows;
};
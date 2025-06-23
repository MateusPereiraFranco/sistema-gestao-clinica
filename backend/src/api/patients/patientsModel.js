const db = require('../../config/db');

// Atualizado para incluir a busca por nome da mãe
exports.findWithFilters = async (filters) => {
    let baseQuery = `
        SELECT patient_id, name, cpf, mother_name, to_char(birth_date, 'DD/MM/YYYY') as birth_date_formatted
        FROM patients
    `;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.name) {
        conditions.push(`unaccent(name) ILIKE unaccent($${paramIndex++})`);
        params.push(`%${filters.name}%`);
    }
    // Novo filtro por nome da mãe
    if (filters.mother_name) {
        conditions.push(`unaccent(mother_name) ILIKE unaccent($${paramIndex++})`);
        params.push(`%${filters.mother_name}%`);
    }
    if (filters.cpf) {
        conditions.push(`cpf = $${paramIndex++}`);
        params.push(filters.cpf);
    }
    if (filters.birth_date) {
        conditions.push(`birth_date = $${paramIndex++}`);
        params.push(filters.birth_date);
    }
    if (filters.startDate) {
        conditions.push(`birth_date >= $${paramIndex++}`);
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        conditions.push(`birth_date <= $${paramIndex++}`);
        params.push(filters.endDate);
    }

    if (conditions.length === 0) {
        return [];
    }

    baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    baseQuery += ' ORDER BY name LIMIT 10;'; // Limita para uma lista de sugestões manejável.

    const { rows } = await db.query(baseQuery, params);
    return rows;
};

// Atualizado para incluir os novos campos
exports.create = async (patientData) => {
    const {
        name, cpf, birth_date, gender, mother_name, cell_phone_1, cell_phone_2,
        cep, street, number, neighborhood, city, state, observations,
        registered_by
    } = patientData;

    const query = `
        INSERT INTO patients (
            name, cpf, birth_date, gender, mother_name, cell_phone_1, cell_phone_2,
            cep, street, "number", neighborhood, city, state, observations,
            registered_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *;
    `;
    const params = [
        name, cpf, birth_date, gender, mother_name, cell_phone_1, cell_phone_2,
        cep, street, number, neighborhood, city, state, observations,
        registered_by
    ];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.update = async (id, {
    name, cpf, birth_date, mother_name, cell_phone_1, cell_phone_2,
    cep, street, number, neighborhood, city, state, observations
}) => {
    const query = `
        UPDATE patients
        SET 
            name = $1, cpf = $2, birth_date = $3, mother_name = $4, cell_phone_1 = $5, 
            cell_phone_2 = $6, cep = $7, street = $8, "number" = $9, neighborhood = $10, 
            city = $11, state = $12, observations = $13, updated_at = NOW()
        WHERE patient_id = $14
        RETURNING *;
    `;
    const params = [
        name, cpf, birth_date, mother_name, cell_phone_1, cell_phone_2,
        cep, street, number, neighborhood, city, state, observations,
        id
    ];
    const { rows } = await db.query(query, params);
    return rows[0];
};
exports.findByCpf = async (cpf) => {
    const query = 'SELECT patient_id, name, cpf FROM patients WHERE cpf = $1;';
    const { rows } = await db.query(query, [cpf]);
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
            patient_id,
            name,
            cpf,
            mother_name,
            to_char(birth_date, 'YYYY-MM-DD') as birth_date, -- Formato para <input type="date">
            cell_phone_1,
            cell_phone_2,
            cep,
            street,
            "number",
            neighborhood,
            city,
            state,
            observations
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
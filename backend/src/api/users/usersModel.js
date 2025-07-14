const db = require('../../config/db');
const { hashPassword } = require('../../utils/passwordUtil');

// Modificado para usar 'specialty_id'
exports.create = async ({ unit_id, name, email, password, profile, specialty_id, has_agenda }) => {
    const hashedPassword = await hashPassword(password);
    const query = `
        INSERT INTO users (unit_id, name, email, password_hash, profile, specialty_id, has_agenda)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING user_id, name, email, profile, specialty_id, has_agenda, created_at;
    `;
    const params = [unit_id, name, email, hashedPassword, profile, specialty_id, has_agenda];
    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.findAllActive = async () => {
    const query = `
        SELECT u.user_id, u.name, u.profile, s.name as specialty_name
        FROM users u
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        WHERE u.is_active = TRUE
        ORDER BY u.name;
    `;
    const { rows } = await db.query(query);
    return rows;
};

// Modificado para incluir o nome da especialidade através de um JOIN
exports.findAll = async (filters = {}) => {
    const { profile, unitId, name, specialtyId, forScheduling, activeOnly } = filters;
    let query = `
        SELECT u.user_id, u.name, u.email, u.profile, u.has_agenda, u.is_active, s.name as specialty_name, un.name as unit_name
        FROM users u
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        LEFT JOIN units un ON u.unit_id = un.unit_id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (unitId) {
        query += ` AND u.unit_id = $${paramIndex++}`;
        params.push(unitId);
    }
    if (name) {
        query += ` AND unaccent(u.name) ILIKE unaccent($${paramIndex++})`;
        params.push(`%${name}%`);
    }
    if (specialtyId && specialtyId !== 'all') {
        query += ` AND u.specialty_id = $${paramIndex++}`;
        params.push(specialtyId);
    }
    if (profile && profile !== 'all') {
        query += ` AND u.profile = $${paramIndex++}`;
        params.push(profile);
    }
    if (forScheduling) {
        query += ` AND u.has_agenda = TRUE`;
    }
    if (activeOnly) {
        query += ` AND u.is_active = TRUE`;
    }

    query += ' ORDER BY u.name;';

    const { rows } = await db.query(query, params);
    return rows;
};

exports.findByEmail = async (email) => {
    const query = `
        SELECT 
            u.*, 
            un.name as unit_name 
        FROM 
            users u 
        LEFT JOIN 
            units un ON u.unit_id = un.unit_id
        WHERE 
            u.email = $1 AND u.is_active = TRUE;
    `;
    const { rows } = await db.query(query, [email]);
    return rows[0];
};
exports.findById = async (id) => {
    const query = 'SELECT * FROM users WHERE user_id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findByIdForEdit = async (id) => {
    const query = `
        SELECT 
            user_id, name, email, profile, unit_id, specialty_id, is_active 
        FROM users 
        WHERE user_id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findByProfile = async (profile) => {
    const query = `
        SELECT u.user_id, u.name, s.name as specialty_name
        FROM users u
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        WHERE u.profile = $1 AND u.is_active = TRUE
        ORDER BY u.name;
    `;
    const { rows } = await db.query(query, [profile]);
    return rows;
};
exports.update = async (id, { name, email, profile, specialty_id, is_active, unit_id, has_agenda }) => {
    const query = `
        UPDATE users
        SET 
            name = $1, email = $2, profile = $3, specialty_id = $4, 
            is_active = $5, unit_id = $6, has_agenda = $7, updated_at = NOW()
        WHERE user_id = $8
        RETURNING user_id, name, email, profile, specialty_id, is_active, unit_id, has_agenda;
    `;
    const params = [name, email, profile, specialty_id, is_active, unit_id, has_agenda, id];
    const { rows } = await db.query(query, params);
    return rows[0];
};
exports.updatePassword = async (id, hashedPassword) => {
    const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2;';
    await db.query(query, [hashedPassword, id]);
};

exports.toggleActiveStatus = async (id, currentStatus) => {
    const query = 'UPDATE users SET is_active = $1 WHERE user_id = $2 RETURNING user_id, is_active;';
    const { rows } = await db.query(query, [!currentStatus, id]);
    return rows[0];
};

exports.updatePasswordByEmail = async (email, hashedPassword) => {
    const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2;';
    await db.query(query, [hashedPassword, email]);
};
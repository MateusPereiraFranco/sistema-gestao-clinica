const db = require('../../config/db');
const { hashPassword } = require('../../utils/passwordUtil');

// Modificado para usar 'specialty_id'
exports.create = async ({ unit_id, name, email, password, profile, specialty_id }) => {
    const hashedPassword = await hashPassword(password);
    const query = `
        INSERT INTO users (unit_id, name, email, password_hash, profile, specialty_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, name, email, profile, specialty_id, created_at;
    `;
    const params = [unit_id, name, email, hashedPassword, profile, specialty_id];
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
exports.findAll = async () => {
    const query = `
        SELECT 
            u.user_id, u.name, u.email, u.profile, u.is_active,
            s.name as specialty_name
        FROM users u
        LEFT JOIN specialties s ON u.specialty_id = s.specialty_id
        ORDER BY u.name;
    `;
    const { rows } = await db.query(query);
    return rows;
};

// ... (outras funções do modelo permanecem maioritariamente as mesmas) ...
exports.findByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE;';
    const { rows } = await db.query(query, [email]);
    return rows[0];
};
exports.findById = async (id) => {
    const query = 'SELECT * FROM users WHERE user_id = $1;';
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
exports.update = async (id, { name, email, profile, specialty_id, is_active }) => {
    const query = `
        UPDATE users
        SET name = $1, email = $2, profile = $3, specialty_id = $4, is_active = $5, updated_at = NOW()
        WHERE user_id = $6
        RETURNING user_id, name, email, profile, specialty_id, is_active;
    `;
    const params = [name, email, profile, specialty_id, is_active, id];
    const { rows } = await db.query(query, params);
    return rows[0];
};
exports.updatePassword = async (id, hashedPassword) => {
    const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2;';
    await db.query(query, [hashedPassword, id]);
};
exports.remove = async (id) => {
    const { rowCount } = await db.query('DELETE FROM users WHERE user_id = $1;', [id]);
    return rowCount;
};
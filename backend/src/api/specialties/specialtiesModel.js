const db = require('../../config/db');

exports.create = async ({ name }) => {
    const query = 'INSERT INTO specialties (name) VALUES ($1) RETURNING *;';
    const { rows } = await db.query(query, [name]);
    return rows[0];
};

exports.findAll = async () => {
    const query = 'SELECT * FROM specialties WHERE is_active = TRUE ORDER BY name;';
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM specialties WHERE specialty_id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.update = async (id, { name, is_active }) => {
    const query = `
        UPDATE specialties 
        SET name = $1, is_active = $2 
        WHERE specialty_id = $3 
        RETURNING *;
    `;
    const { rows } = await db.query(query, [name, is_active, id]);
    return rows[0];
};
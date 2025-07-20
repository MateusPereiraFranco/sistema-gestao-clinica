const db = require('../../config/db');

exports.findAll = async (filters = {}) => {
    let query = 'SELECT * FROM units';
    const params = [];
    if (filters.is_active !== undefined) {
        query += ' WHERE is_active = $1';
        params.push(filters.is_active);
    }
    query += ' ORDER BY name ASC';
    const { rows } = await db.query(query, params);
    return rows;
};

exports.findById = async (id) => {
    const { rows } = await db.query('SELECT * FROM units WHERE unit_id = $1', [id]);
    return rows[0];
};

exports.create = async ({ name, address }) => {
    const { rows } = await db.query(
        'INSERT INTO units (name, address) VALUES ($1, $2) RETURNING *',
        [name, address]
    );
    return rows[0];
};

exports.update = async (id, { name, address, is_active }) => {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        params.push(name);
    }
    if (address !== undefined) {
        fields.push(`address = $${paramIndex++}`);
        params.push(address);
    }
    if (is_active !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        params.push(is_active);
    }

    if (fields.length === 0) {
        return this.findById(id);
    }

    params.push(id);
    const query = `UPDATE units SET ${fields.join(', ')} WHERE unit_id = $${paramIndex} RETURNING *`;

    const { rows } = await db.query(query, params);
    return rows[0];
};

exports.delete = async (id) => {
    const result = await db.query('DELETE FROM units WHERE unit_id = $1', [id]);
    return result.rowCount > 0;
};

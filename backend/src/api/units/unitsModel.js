const db = require('../../config/db');

// Busca todas as unidades ativas, ordenadas por nome.
exports.findAll = async () => {
    const query = 'SELECT unit_id, name FROM units WHERE is_active = TRUE ORDER BY name;';
    const { rows } = await db.query(query);
    return rows;
};
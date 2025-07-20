const db = require('../../config/db');

exports.createLog = async (logData) => {
    const { user_id, action, target_entity, target_id, details } = logData;

    const query = `
        INSERT INTO audit_logs (user_id, action, target_entity, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
    `;

    try {
        // O JSON.stringify é importante para o campo 'details' que é do tipo JSONB
        await db.query(query, [user_id, action, target_entity, target_id, JSON.stringify(details || {})]);
    } catch (error) {
        // É crucial que uma falha ao gravar o log de auditoria NÃO quebre a aplicação.
        // Apenas registramos o erro no console para futura depuração.
        console.error("Falha ao gravar log de auditoria:", error);
    }
};
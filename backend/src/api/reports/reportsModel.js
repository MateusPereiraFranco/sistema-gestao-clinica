const db = require('../../config/db');

exports.getServicesSummary = async (filters) => {
    const { startDate, endDate, professionalId } = filters;

    let query = `
        SELECT
            u.name as professional_name,
            s.name as specialty_name,
            COUNT(apt.appointment_id) as service_count
        FROM
            users u
        LEFT JOIN
            specialties s ON u.specialty_id = s.specialty_id
        LEFT JOIN
            -- A filtragem dos atendimentos é feita numa subquery para que o LEFT JOIN funcione corretamente.
            (
                SELECT * FROM appointments
                WHERE status = 'completed'
                AND appointment_datetime::date BETWEEN $1 AND $2
            ) apt ON u.user_id = apt.professional_id
        WHERE
            u.profile = 'normal'
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;

    // Se um profissional específico for selecionado, adiciona um filtro à query principal.
    if (professionalId && professionalId !== 'all') {
        query += ` AND u.user_id = $${paramIndex++}`;
        params.push(professionalId);
    }

    query += `
        GROUP BY
            u.user_id, s.name
        ORDER BY
            professional_name ASC;
    `;

    const { rows } = await db.query(query, params);
    return rows;
};
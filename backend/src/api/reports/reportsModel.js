const db = require('../../config/db');

exports.getGroupedServicesSummary = async (filters) => {
    const { startDate, endDate, professionalId, unitId } = filters;

    let query = `
        SELECT
            u.user_id,
            u.name as professional_name,
            s.name as specialty_name,
            p.vinculo,
            COUNT(apt.appointment_id)::integer as service_count
        FROM
            users u
        LEFT JOIN
            specialties s ON u.specialty_id = s.specialty_id
        LEFT JOIN
            (
                SELECT * FROM appointments
                WHERE status = 'completed'
                AND appointment_datetime::date BETWEEN $1 AND $2
            ) apt ON u.user_id = apt.professional_id
        LEFT JOIN
            patients p ON apt.patient_id = p.patient_id
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;

    const whereConditions = ["u.profile = 'normal'", "u.is_active = TRUE"];
    if (professionalId && professionalId !== 'all') {
        whereConditions.push(`u.user_id = $${paramIndex++}`);
        params.push(professionalId);
    }

    // Adiciona o filtro de unidade à consulta se ele for fornecido
    if (unitId) {
        whereConditions.push(`u.unit_id = $${paramIndex++}`);
        params.push(unitId);
    }

    query += ` WHERE ${whereConditions.join(' AND ')}`;

    query += `
        GROUP BY
            u.user_id, s.name, p.vinculo
        ORDER BY
            professional_name ASC, p.vinculo ASC;
    `;

    const { rows } = await db.query(query, params);
    return rows;
};
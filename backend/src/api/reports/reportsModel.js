const db = require('../../config/db');

exports.getGroupedServicesSummary = async (filters) => {
    const { startDate, endDate, professionalId } = filters;

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
        WHERE
            u.profile = 'normal' AND u.is_active = TRUE
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;

    if (professionalId && professionalId !== 'all') {
        query += ` AND u.user_id = $${paramIndex++}`;
        params.push(professionalId);
    }

    query += `
        GROUP BY
            u.user_id, s.name, p.vinculo
        ORDER BY
            professional_name ASC, p.vinculo ASC;
    `;

    const { rows } = await db.query(query, params);
    return rows;
};
const db = require('../../config/db');

exports.getGroupedServicesSummary = async (filters) => {
    const { startDate, endDate, professionalId, unitId, includeInactive } = filters;
    let query = `
        SELECT
            u.user_id,
            u.name as professional_name,
            u.has_agenda,
            s.name as specialty_name,
            COALESCE(apt.vinculo, 'nenhum') as vinculo, -- CORREÇÃO AQUI: Garante que vinculo não seja NULL
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

    const whereConditions = ['u.has_agenda = true'];
    if (professionalId && professionalId !== 'all') {
        whereConditions.push(`u.user_id = $${paramIndex++}`);
        params.push(professionalId);
    }

    // Adiciona o filtro de unidade à consulta se ele for fornecido
    if (unitId) {
        whereConditions.push(`u.unit_id = $${paramIndex++}`);
        params.push(unitId);
    }
    if (includeInactive === 'false') {
        whereConditions.push('u.is_active = TRUE');
    }

    query += ` WHERE ${whereConditions.join(' AND ')}`;

    query += `
        GROUP BY
            u.user_id, s.name, apt.vinculo
        ORDER BY
            professional_name ASC, apt.vinculo ASC;
    `;

    const { rows } = await db.query(query, params);
    return rows;
};
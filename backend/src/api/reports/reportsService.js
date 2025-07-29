const reportsModel = require('./reportsModel');
const unitModel = require('../units/unitsModel');

exports.getGroupedSummaryReport = async (filters, user) => {
    if (!filters.startDate || !filters.endDate) {
        throw new Error("Data de início e data de fim são obrigatórias.");
    }

    if (user.profile === 'master' || user.profile === 'normal') {
        filters.unitId = user.unit_id;
    }
    const flatData = await reportsModel.getGroupedServicesSummary(filters);

    const professionalMap = new Map();

    for (const item of flatData) {
        if (!professionalMap.has(item.user_id)) {
            professionalMap.set(item.user_id, {
                user_id: item.user_id,
                professional_name: item.professional_name,
                specialty_name: item.specialty_name,
                summary: { saude: 0, educação: 0, AMA: 0, nenhum: 0 },
                service_count: 0
            });
        }

        const professional = professionalMap.get(item.user_id);
        if (item.vinculo && item.service_count > 0) {
            if (professional.summary.hasOwnProperty(item.vinculo)) {
                professional.summary[item.vinculo] = item.service_count;
            }
            professional.service_count += item.service_count;
        }
    }

    const reportData = Array.from(professionalMap.values());

    let unitName = 'AMA';

    if (user.unit_id) {
        const unit = await unitModel.findById(user.unit_id);
        if (unit) {
            unitName = unit.name;
        }
    }

    return {
        data: reportData,
        unitName: unitName
    };
};

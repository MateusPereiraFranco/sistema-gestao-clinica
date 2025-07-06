const reportsModel = require('./reportsModel');

exports.getServicesSummaryReport = async (filters, user) => {

    if (!filters.startDate || !filters.endDate) {
        throw new Error("Data de início e data de fim são obrigatórias.");
    }

    return reportsModel.getServicesSummary(filters);
};
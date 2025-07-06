const reportsService = require('./reportsService');

exports.getServicesSummary = async (req, res, next) => {
    try {
        // Passa os filtros da query e o utilizador autenticado para o serviço.
        const reportData = await reportsService.getServicesSummaryReport(req.query, req.user);
        res.status(200).json(reportData);
    } catch (error) {
        next(error);
    }
};
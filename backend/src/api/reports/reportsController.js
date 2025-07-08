const reportsService = require('./reportsService');

exports.getServicesSummary = async (req, res, next) => {
    try {
        const reportData = await reportsService.getGroupedSummaryReport(req.query, req.user);
        res.status(200).json(reportData);
    } catch (error) {
        next(error);
    }
};
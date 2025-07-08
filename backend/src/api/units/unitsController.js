const unitsService = require('./unitsService');

exports.getAllUnits = async (req, res, next) => {
    try {
        const units = await unitsService.getAllUnits();
        res.status(200).json(units);
    } catch (error) {
        next(error);
    }
};
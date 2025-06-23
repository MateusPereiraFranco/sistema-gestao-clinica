const specialtyService = require('./specialtiesService');

exports.createSpecialty = async (req, res, next) => {
    try {
        const newSpecialty = await specialtyService.createSpecialty(req.body);
        res.status(201).json(newSpecialty);
    } catch (error) {
        next(error);
    }
};

exports.getAllSpecialties = async (req, res, next) => {
    try {
        const specialties = await specialtyService.getAllSpecialties();
        res.status(200).json(specialties);
    } catch (error) {
        next(error);
    }
};
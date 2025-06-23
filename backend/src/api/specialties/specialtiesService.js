const specialtyModel = require('./specialtiesModel');

exports.createSpecialty = async (specialtyData) => {
    if (!specialtyData.name) {
        const error = new Error('O nome da especialidade é obrigatório.');
        error.statusCode = 400;
        throw error;
    }
    return specialtyModel.create(specialtyData);
};

exports.getAllSpecialties = async () => {
    return specialtyModel.findAll();
};
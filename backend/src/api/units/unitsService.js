const unitsModel = require('./unitsModel');

exports.getAllUnits = async () => {
    return unitsModel.findAll();
};
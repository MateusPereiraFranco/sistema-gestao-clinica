const unitModel = require('./unitsModel');
const auditLogModel = require('../auditLogs/auditLogModel');

exports.getAllUnits = async (req, res, next) => {
    try {
        const { is_active } = req.query;
        const units = await unitModel.findAll({ is_active });
        res.status(200).json(units);
    } catch (error) {
        next(error);
    }
};

exports.getUnitById = async (req, res, next) => {
    try {
        const unit = await unitModel.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unidade não encontrada.' });
        }
        res.status(200).json(unit);
    } catch (error) {
        next(error);
    }
};

exports.createUnit = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'O nome da unidade é obrigatório.' });
        }
        const newUnit = await unitModel.create({ name, address });
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'CREATE_UNIT',
            target_entity: 'units',
            target_id: newUnit.unit_id,
            details: { name: newUnit.name, address: newUnit.address }
        });
        res.status(201).json(newUnit);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Já existe uma unidade com este nome.' });
        }
        next(error);
    }
};

exports.updateUnit = async (req, res, next) => {
    try {
        const unit = await unitModel.findById(req.params.id);
        const { name, address } = req.body;
        const updatedUnit = await unitModel.update(req.params.id, { name, address });
        if (!updatedUnit) {
            return res.status(404).json({ message: 'Unidade não encontrada.' });
        }

        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'UPDATED',
            target_entity: 'units',
            target_id: updatedUnit.unit_id,
            details: {
                before: unit,
                after: updatedUnit
            }
        });
        res.status(200).json(updatedUnit);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Já existe uma unidade com este nome.' });
        }
        next(error);
    }
};

exports.toggleUnitStatus = async (req, res, next) => {
    try {
        const unit = await unitModel.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unidade não encontrada.' });
        }
        const updatedUnit = await unitModel.update(req.params.id, { is_active: !unit.is_active });
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: updatedUnit.is_active ? 'ACTIVATE_UNIT' : 'DEACTIVATE_UNIT',
            target_entity: 'units',
            target_id: updatedUnit.unit_id,
            details: { from_status: unit.is_active, to_status: updatedUnit.is_active }
        });
        res.status(200).json(updatedUnit);
    } catch (error) {
        next(error);
    }
};

exports.deleteUnit = async (req, res, next) => {
    try {
        const deleted = await unitModel.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Unidade não encontrada.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

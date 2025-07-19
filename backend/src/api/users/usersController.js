const userService = require('./usersService');
const auditLogModel = require('../auditLogs/auditLogModel');

exports.createUser = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body, req.user);
        const { password_hash, ...logDetails } = newUser;
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'CREATE_USER',
            target_entity: 'users',
            target_id: newUser.user_id,
            details: logDetails
        });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const { name, specialtyId, profile, is_active, has_agenda } = req.query;
        const filters = { name, specialtyId, profile, is_active: is_active === 'true', has_agenda };
        const users = await userService.getAllUsers(filters, req.user);
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id, req.user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

exports.getUserForEdit = async (req, res, next) => {
    try {
        const user = await userService.getUserForEdit(req.params.id, req.user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const originalUser = await userModel.findById(req.params.id);
        if (!originalUser) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }
        const updatedUser = await userService.updateUser(req.params.id, req.body, req.user);
        const { password_hash: originalPassword, ...originalLogDetails } = originalUser;
        const { password_hash: updatedPassword, ...updatedLogDetails } = updatedUser;

        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: 'UPDATE_USER',
            target_entity: 'users',
            target_id: userId,
            details: {
                before: originalLogDetails,
                after: updatedLogDetails
            }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

exports.toggleUserStatus = async (req, res, next) => {
    try {
        const userToToggle = await userModel.findById(req.params.id);
        if (!userToToggle) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }
        await userService.toggleUserStatus(req.params.id, req.user);
        await auditLogModel.createLog({
            user_id: req.user.user_id,
            action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            target_entity: 'users',
            target_id: req.params.id,
            details: {
                user_name: userToToggle.name,
                from_status: userToToggle.is_active,
                to_status: newStatus
            }
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
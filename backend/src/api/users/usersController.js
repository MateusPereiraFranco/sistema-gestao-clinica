const userService = require('./usersService');

exports.createUser = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body, req.user);
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
        const updatedUser = await userService.updateUser(req.params.id, req.body, req.user);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

exports.toggleUserStatus = async (req, res, next) => {
    try {
        await userService.toggleUserStatus(req.params.id, req.user);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
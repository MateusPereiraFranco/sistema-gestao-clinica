const authService = require('./authService');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    // Para ser consistente, vamos retornar os dados higienizados através do serviço.
    try {
        const user = await require('../users/usersService').getUserById(req.user.user_id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const data = await authService.updatePassword(req.user.user_id, currentPassword, newPassword);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.requestPasswordReset(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// NOVO CONTROLLER
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;
        const result = await authService.resetPassword(email, token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
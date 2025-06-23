const jwt = require('jsonwebtoken');
const userModel = require('../api/users/usersModel');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await userModel.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não encontrado.' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'Não autorizado, token inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Não autorizado, token não fornecido.' });
    }
};

exports.restrictTo = (...profiles) => {
    return (req, res, next) => {
        if (!profiles.includes(req.user.profile)) {
            return res.status(403).json({ error: 'Você não tem permissão para realizar esta ação.' });
        }
        next();
    };
};
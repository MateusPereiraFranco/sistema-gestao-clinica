const jwt = require('jsonwebtoken');
const userModel = require('../users/usersModel');
const { comparePassword, hashPassword } = require('../../utils/passwordUtil');

exports.login = async (email, password) => {
    const user = await userModel.findByEmail(email);
    if (!user || !(await comparePassword(password, user.password_hash))) {
        const error = new Error('Email ou palavra-passe inválidos.');
        error.statusCode = 401;
        throw error;
    }
    const token = jwt.sign({ id: user.user_id, profile: user.profile }, process.env.JWT_SECRET, { expiresIn: '1d' });
    delete user.password_hash;
    return { token, user };
};

exports.updatePassword = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        const error = new Error('Palavra-passe atual e nova palavra-passe são obrigatórias.');
        error.statusCode = 400;
        throw error;
    }

    // 1. Busca os dados frescos e completos do utilizador, incluindo o hash.
    const user = await userModel.findById(userId);

    // Medida de segurança extra, embora o token deva garantir isto.
    if (!user) {
        const error = new Error('Utilizador não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    // 2. Compara a palavra-passe atual com o hash obtido.
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
        const error = new Error('A sua palavra-passe atual está incorreta.');
        error.statusCode = 401;
        throw error;
    }

    // 3. Gera o novo hash e atualiza na base de dados.
    const hashedNewPassword = await hashPassword(newPassword);
    await userModel.updatePassword(user.user_id, hashedNewPassword);

    // 4. Gera um novo token.
    const token = jwt.sign({ id: user.user_id, profile: user.profile }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { token };
};
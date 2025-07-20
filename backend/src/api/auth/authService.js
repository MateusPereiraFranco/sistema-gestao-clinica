const jwt = require('jsonwebtoken');
const userModel = require('../users/usersModel');
const { comparePassword, hashPassword } = require('../../utils/passwordUtil');
const crypto = require('crypto');
const authModel = require('./authModel');
const sendEmail = require('../../utils/emailService');

exports.login = async (email, password) => {
    const user = await userModel.findByEmail(email);
    if (!user || !(await comparePassword(password, user.password_hash))) {
        const error = new Error('Email ou palavra-passe inválidos.');
        error.statusCode = 401;
        throw error;
    }
    const token = jwt.sign({ id: user.user_id, profile: user.profile }, process.env.JWT_SECRET, { expiresIn: '8h' });
    delete user.password_hash;
    return { token, user };
};

exports.updatePassword = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        const error = new Error('Palavra-passe atual e nova palavra-passe são obrigatórias.');
        error.statusCode = 400;
        throw error;
    }

    const user = await userModel.findById(userId);

    if (!user) {
        const error = new Error('Utilizador não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
        const error = new Error('A sua palavra-passe atual está incorreta.');
        error.statusCode = 401;
        throw error;
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await userModel.updatePassword(user.user_id, hashedNewPassword);

    const token = jwt.sign({ id: user.user_id, profile: user.profile }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return { token };
};

exports.requestPasswordReset = async (email) => {
    const user = await userModel.findByEmail(email);
    if (!user) {
        return;
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await authModel.createPasswordResetToken(email, hashedToken, expiresAt);

    const message = `Você solicitou a redefinição de senha. Use o seguinte código para continuar:\n\n${resetToken}\n\nSe você não solicitou isto, por favor ignore este email. O código é válido por 10 minutos.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Código de Recuperação de Senha - Clínica IOA',
            message,
        });
    } catch (error) {
        await authModel.deleteResetToken(email);
        throw new Error('Houve um erro ao enviar o email. Tente novamente mais tarde.');
    }

    return { message: "Se o email estiver registado, um código de recuperação foi enviado." };
};

exports.resetPassword = async (email, token, newPassword) => {
    const resetEntry = await authModel.findResetTokenByEmail(email);

    if (!resetEntry || new Date() > new Date(resetEntry.expires_at)) {
        throw new Error("Código inválido ou expirado.");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (hashedToken !== resetEntry.token) {
        throw new Error("Código inválido ou expirado.");
    }

    const newHashedPassword = await hashPassword(newPassword);
    await userModel.updatePasswordByEmail(email, newHashedPassword);
    await authModel.deleteResetToken(email);

    return { message: "Palavra-passe redefinida com sucesso." };
};
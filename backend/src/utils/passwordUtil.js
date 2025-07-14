const bcrypt = require('bcryptjs');

/**
 * Gera o hash de uma senha.
 * @param {string} password - A senha em texto plano.
 * @returns {Promise<string>} O hash da senha.
 */
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compara uma senha em texto plano com um hash.
 * @param {string} password - A senha em texto plano.
 * @param {string} hashedPassword - O hash armazenado no banco.
 * @returns {Promise<boolean>} True se as senhas correspondem.
 */
exports.comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
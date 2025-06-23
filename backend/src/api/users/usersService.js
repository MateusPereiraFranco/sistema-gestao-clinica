const userModel = require('./usersModel');

// Apenas uma pequena modificação na validação, o resto é igual
exports.createUser = async (userData) => {
    const { email, password, name, specialty_id } = userData; // specialty_id é opcional
    if (!email || !password || !name) {
        const error = new Error('Nome, email e palavra-passe são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    return userModel.create(userData);
};

// ... (outras funções do serviço permanecem as mesmas) ...
exports.getAllUsers = async () => {
    return userModel.findAll();
};
exports.getUserById = async (id) => {
    const user = await userModel.findById(id);
    if (!user) {
        const error = new Error('Utilizador não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    delete user.password_hash;
    return user;
};
exports.updateUser = async (id, userData) => {
    const userToUpdate = await userModel.findById(id);
    if (!userToUpdate) {
        const error = new Error('Utilizador a ser atualizado não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    return userModel.update(id, userData);
};
exports.deleteUser = async (id) => {
    const deletedCount = await userModel.remove(id);
    if (deletedCount === 0) {
        const error = new Error('Utilizador a ser apagado não encontrado.');
        error.statusCode = 404;
        throw error;
    }
};
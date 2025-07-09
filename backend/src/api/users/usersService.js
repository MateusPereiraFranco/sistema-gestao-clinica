const userModel = require('./usersModel');

// Apenas uma pequena modificação na validação, o resto é igual
exports.createUser = async (userData, requestingUser) => {
    const { email, password, name, specialty_id } = userData; // specialty_id é opcional
    if (!email || !password || !name) {
        const error = new Error('Nome, email e palavra-passe são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    // Se o criador for 'master', força o novo utilizador a pertencer à mesma unidade.
    if (requestingUser.profile === 'master') {
        userData.unit_id = requestingUser.unit_id;
    } else if (requestingUser.profile === 'admin' && !userData.unit_id) {
        throw new Error('A unidade é obrigatória para a criação de um novo utilizador.');
    }
    return userModel.create(userData);
};

// ... (outras funções do serviço permanecem as mesmas) ...
exports.getAllUsers = async (filters, requestingUser) => {
    if (requestingUser.profile === 'master' || requestingUser.profile === 'normal') {
        filters.unitId = requestingUser.unit_id;
    }
    return userModel.findAll(filters);
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

exports.updateUser = async (id, userData, requestingUser) => {
    const userToUpdate = await userModel.findById(id);
    if (!userToUpdate) {
        const error = new Error('Utilizador a ser atualizado não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (requestingUser.profile === 'master') {
        if (!requestingUser.unit_id) {
            throw new Error('O gestor não está associado a nenhuma unidade.');
        }
        userData.unit_id = requestingUser.unit_id;
    } else if (requestingUser.profile === 'admin' && !userData.unit_id) {
        // REGRA DE NEGÓCIO: Se o criador for 'admin', a unidade é obrigatória.
        throw new Error('A unidade é obrigatória para a criação de um novo utilizador.');
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
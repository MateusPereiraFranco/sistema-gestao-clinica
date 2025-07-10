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

exports.getUserForEdit = async (userIdToEdit, requestingUser) => {
    const userToEdit = await userModel.findByIdForEdit(userIdToEdit);
    if (!userToEdit) {
        throw new Error('Utilizador não encontrado.');
    }
    // Se o requerente for 'master', ele só pode editar utilizadores da sua própria unidade.
    if (requestingUser.profile === 'master' && userToEdit.unit_id !== requestingUser.unit_id) {
        throw new Error('Acesso negado. Não pode editar utilizadores de outra unidade.');
    }
    return userToEdit;
};

exports.updateUser = async (id, userData, requestingUser) => {
    const userToUpdate = await userModel.findById(id);
    if (!userToUpdate) {
        throw new Error('Utilizador a ser atualizado não encontrado.');
    }

    // REGRA DE NEGÓCIO: Um 'master' não pode transferir um utilizador para outra unidade.
    if (requestingUser.profile === 'master') {
        if (userData.unit_id && userData.unit_id !== userToUpdate.unit_id) {
            throw new Error("Gestores de unidade não podem transferir utilizadores.");
        }
        // Garante que o master não altere a unidade acidentalmente.
        userData.unit_id = userToUpdate.unit_id;
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
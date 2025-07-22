const userModel = require('./usersModel');

exports.createUser = async (userData, requestingUser) => {
    const { email, password, name, specialty_id, has_agenda } = userData;
    if (!email || !password || !name || !specialty_id) {
        const error = new Error('Nome, email e palavra-passe são obrigatórios.');
        error.statusCode = 400;
        throw error;
    }
    if (requestingUser.profile === 'master') {
        userData.unit_id = requestingUser.unit_id;
    } else if (requestingUser.profile === 'admin' && !userData.unit_id) {
        throw new Error('A unidade é obrigatória para a criação de um novo utilizador.');
    }
    return userModel.create(userData);
};

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

    if (requestingUser.profile === 'master') {
        if (userData.unit_id && userData.unit_id !== userToUpdate.unit_id) {
            throw new Error("Gestores de unidade não podem transferir utilizadores.");
        }
        userData.unit_id = userToUpdate.unit_id;
    }

    return userModel.update(id, userData);
};

exports.toggleUserStatus = async (userIdToToggle, requestingUser) => {
    const userToToggle = await userModel.findById(userIdToToggle);
    if (!userToToggle) throw new Error("Utilizador não encontrado.");

    if (requestingUser.profile === 'master' && userToToggle.unit_id !== requestingUser.unit_id) {
        throw new Error("Não pode alterar utilizadores de outra unidade.");
    }

    return userModel.toggleActiveStatus(userIdToToggle, userToToggle.is_active);
};
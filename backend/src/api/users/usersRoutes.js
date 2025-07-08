const { Router } = require('express');
const userController = require('./usersController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { checkUnitAccess } = require('../../middlewares/permissionMiddleware');

const router = Router();

// CORREÇÃO: A regra geral "router.use(protect, restrictTo('master'))" foi removida.
// Agora, aplicamos a segurança a cada rota individualmente.

router.route('/')
    // Qualquer utilizador autenticado pode listar os profissionais para a agenda.
    .get(protect, userController.getAllUsers)
    // Apenas um master pode criar um novo utilizador.
    .post(protect, restrictTo('admin', 'master'), userController.createUser);

router.route('/:id')
    // Apenas um master pode ver, atualizar ou apagar os detalhes de um utilizador.
    .get(protect, checkUnitAccess('patients'), restrictTo('admin', 'master'), userController.getUserById)
    .put(protect, checkUnitAccess('patients'), restrictTo('admin', 'master'), userController.updateUser)
    .delete(protect, checkUnitAccess('patients'), restrictTo('admin', 'master'), userController.deleteUser);

module.exports = router;
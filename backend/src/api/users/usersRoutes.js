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
    .post(protect, restrictTo('master'), userController.createUser);

router.get('/:id/for-edit', protect, userController.getUserForEdit);
router.patch('/:id/toggle-active', protect, restrictTo('admin', 'master'), userController.toggleUserStatus);

router.route('/:id')
    // Apenas um master pode ver, atualizar ou apagar os detalhes de um utilizador.
    .get(protect, restrictTo('admin', 'master'), userController.getUserById)
    .put(protect, restrictTo('admin', 'master'), userController.updateUser)

module.exports = router;
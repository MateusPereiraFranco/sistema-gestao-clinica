const { Router } = require('express');
const userController = require('./usersController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();

// Todas as rotas de gestão de utilizadores são protegidas e restritas a 'master'
router.use(protect, restrictTo('master'));

router.route('/')
    .post(userController.createUser)
    .get(userController.getAllUsers);

router.route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
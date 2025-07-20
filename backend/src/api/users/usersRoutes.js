const { Router } = require('express');
const userController = require('./usersController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { checkUnitAccess } = require('../../middlewares/permissionMiddleware');

const router = Router();

router.route('/')
    .get(protect, userController.getAllUsers)
    .post(protect, restrictTo('admin', 'master'), userController.createUser);

router.get('/:id/for-edit', protect, userController.getUserForEdit);
router.patch('/:id/toggle-active', protect, restrictTo('admin', 'master'), userController.toggleUserStatus);

router.route('/:id')
    .get(protect, restrictTo('admin', 'master'), userController.getUserById)
    .put(protect, restrictTo('admin', 'master'), userController.updateUser)

module.exports = router;
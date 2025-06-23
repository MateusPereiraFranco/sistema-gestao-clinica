const { Router } = require('express');
const authController = require('./authController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();

router.post('/login', authController.login);

// Rotas que exigem que o utilizador esteja autenticado
router.use(protect);

router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
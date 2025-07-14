const { Router } = require('express');
const authController = require('./authController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();

router.post('/login', authController.login);
router.patch('/update-password', authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas que exigem que o utilizador esteja autenticado
router.use(protect);

router.get('/me', authController.getMe);


module.exports = router;
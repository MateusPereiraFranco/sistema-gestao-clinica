const { Router } = require('express');
const authController = require('./authController');
const { protect } = require('../../middlewares/authMiddleware');
const { loginLimiter } = require('../../config/rateLimiter');

const router = Router();

router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.use(protect);

router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);


module.exports = router;
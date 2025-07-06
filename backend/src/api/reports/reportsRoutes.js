const { Router } = require('express');
const reportsController = require('./reportsController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect); // Protege todas as rotas de relatórios

router.get('/services-summary', reportsController.getServicesSummary);

module.exports = router;
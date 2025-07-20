const { Router } = require('express');
const reportsController = require('./reportsController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect);

router.get('/services-summary', reportsController.getServicesSummary);

module.exports = router;
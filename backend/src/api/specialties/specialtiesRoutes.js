const { Router } = require('express');
const specialtyController = require('./specialtiesController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();

router.post('/', protect, restrictTo('admin', 'master'), specialtyController.createSpecialty);

router.get('/', protect, specialtyController.getAllSpecialties);

module.exports = router;
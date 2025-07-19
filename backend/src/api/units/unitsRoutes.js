const { Router } = require('express');
const unitsController = require('./unitsController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();
router.use(protect);

// Todos os utilizadores autenticados podem ver a lista de unidades.
router.get('/', unitsController.getAllUnits);
router.post('/', restrictTo('admin'), unitsController.createUnit);

router.route('/:id')
    .get(unitsController.getUnitById)
    .patch(restrictTo('admin'), unitsController.updateUnit)
    .delete(restrictTo('admin'), unitsController.deleteUnit);

router.patch('/:id/toggle-active', unitsController.toggleUnitStatus);

module.exports = router;
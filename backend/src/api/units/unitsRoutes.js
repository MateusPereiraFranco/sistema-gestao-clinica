const { Router } = require('express');
const unitsController = require('./unitsController');
const { protect } = require('../../middlewares/authMiddleware');

const router = Router();
// Todos os utilizadores autenticados podem ver a lista de unidades.
router.get('/', protect, unitsController.getAllUnits);

module.exports = router;
const { Router } = require('express');
const specialtyController = require('./specialtiesController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = Router();

// Apenas utilizadores "master" podem criar novas especialidades.
router.post('/', protect, restrictTo('admin', 'master'), specialtyController.createSpecialty);

// Todos os utilizadores autenticados podem listar as especialidades (útil para formulários).
router.get('/', protect, specialtyController.getAllSpecialties);

module.exports = router;
const express = require('express');
const ctrl = require('../controllers/moduleController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.getAllModules);
router.get('/:id', ctrl.getModuleById);

router.post('/', requireAdmin, ctrl.createModule);
router.put('/:id', requireAdmin, ctrl.updateModule);
router.delete('/:id', requireAdmin, ctrl.deleteModule);

module.exports = router;

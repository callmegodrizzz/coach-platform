const express = require('express');
const ctrl = require('../controllers/lessonController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:id', ctrl.getLessonById);

router.post('/', requireAdmin, ctrl.createLesson);
router.put('/:id', requireAdmin, ctrl.updateLesson);
router.delete('/:id', requireAdmin, ctrl.deleteLesson);

module.exports = router;

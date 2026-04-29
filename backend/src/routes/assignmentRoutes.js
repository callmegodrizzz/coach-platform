const express = require('express');
const ctrl = require('../controllers/assignmentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', ctrl.submitAssignment);
router.get('/me', ctrl.getMyAssignments);

router.get('/', requireAdmin, ctrl.getAllAssignments);
router.put('/:id', requireAdmin, ctrl.reviewAssignment);

module.exports = router;

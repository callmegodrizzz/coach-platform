const express = require('express');
const ctrl = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', ctrl.markLessonCompleted);
router.get('/me', ctrl.getMyProgress);

module.exports = router;

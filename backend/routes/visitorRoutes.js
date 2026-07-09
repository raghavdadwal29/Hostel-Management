const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const visitor = require('../controllers/visitorController');

router.get('/', protect, visitor.getVisitors);
router.post('/', protect, authorize('student'), visitor.registerVisitor);
router.put('/:id/review', protect, authorize('student', 'warden', 'admin'), visitor.reviewVisitor);
router.put('/:id/check-in', protect, authorize('warden', 'admin'), visitor.checkIn);
router.put('/:id/check-out', protect, authorize('warden', 'admin'), visitor.checkOut);

module.exports = router;

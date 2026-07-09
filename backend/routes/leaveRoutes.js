const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const leave = require('../controllers/leaveController');

router.get('/', protect, leave.getLeaves);
router.post('/', protect, authorize('student'), leave.applyLeave);
router.put('/:id/review', protect, authorize('warden', 'admin'), leave.reviewLeave);

module.exports = router;

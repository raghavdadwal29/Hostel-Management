const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const attendance = require('../controllers/attendanceController');

router.get('/', protect, attendance.getAttendance);
router.get('/stats', protect, authorize('admin', 'warden'), attendance.getMonthlyStats);
router.post('/mark', protect, authorize('warden', 'admin'), attendance.markAttendance);

module.exports = router;

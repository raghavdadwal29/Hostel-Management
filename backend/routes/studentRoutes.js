const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const student = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/profile', student.getMyProfile);
router.put('/profile', student.updateMyProfile);
router.post('/apply', student.applyForHostel);
router.get('/qr-code', student.getMyQrCode);

module.exports = router;

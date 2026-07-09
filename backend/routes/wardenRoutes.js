const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const warden = require('../controllers/wardenController');

router.get('/dashboard', protect, authorize('warden'), warden.getDashboard);
router.get('/students', protect, authorize('warden'), warden.getMyStudents);

module.exports = router;

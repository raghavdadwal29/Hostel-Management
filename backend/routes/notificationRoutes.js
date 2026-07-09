const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notification = require('../controllers/notificationController');

router.get('/', protect, notification.getMyNotifications);
router.put('/:id/read', protect, notification.markAsRead);
router.put('/read-all', protect, notification.markAllAsRead);

module.exports = router;

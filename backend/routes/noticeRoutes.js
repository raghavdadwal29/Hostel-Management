const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const notice = require('../controllers/noticeController');

router.get('/', protect, notice.getNotices);
router.post('/', protect, authorize('admin', 'warden'), notice.createNotice);
router.put('/:id', protect, authorize('admin', 'warden'), notice.updateNotice);
router.delete('/:id', protect, authorize('admin', 'warden'), notice.deleteNotice);

module.exports = router;

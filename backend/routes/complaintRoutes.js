const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const complaint = require('../controllers/complaintController');

router.get('/', protect, complaint.getComplaints);
router.get('/:id', protect, complaint.getComplaint);
router.post('/', protect, authorize('student'), upload.array('images', 4), complaint.createComplaint);
router.put('/:id/status', protect, authorize('admin', 'warden'), complaint.updateComplaintStatus);
router.post('/:id/comments', protect, complaint.addComment);

module.exports = router;

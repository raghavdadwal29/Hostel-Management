const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const report = require('../controllers/reportController');

router.get('/students/csv', protect, authorize('admin'), report.exportStudentsCsv);
router.get('/fees/csv', protect, authorize('admin'), report.exportFeesCsv);
router.get('/summary/pdf', protect, authorize('admin'), report.exportSummaryPdf);

module.exports = router;

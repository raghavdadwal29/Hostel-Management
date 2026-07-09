const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', admin.getDashboardStats);

router.get('/students', admin.getStudents);
router.get('/students/:id', admin.getStudent);
router.post('/students', admin.createStudent);
router.put('/students/:id', admin.updateStudent);
router.delete('/students/:id', admin.deleteStudent);

router.get('/applications', admin.getApplications);
router.put('/applications/:id/review', admin.reviewApplication);

router.get('/wardens', admin.getWardens);
router.post('/wardens', admin.createWarden);
router.put('/wardens/:id', admin.updateWarden);
router.delete('/wardens/:id', admin.deleteWarden);

router.get('/fees', admin.getAllFees);
router.post('/fees/generate', admin.generateFee);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const fee = require('../controllers/feeController');

router.get('/my-fees', protect, authorize('student'), fee.getMyFees);
router.post('/:id/pay/order', protect, authorize('student'), fee.createPaymentOrder);
router.post('/:id/pay/confirm', protect, authorize('student'), fee.confirmPayment);
router.get('/:id/receipt', protect, fee.downloadReceipt);

module.exports = router;

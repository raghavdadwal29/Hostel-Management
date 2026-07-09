const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { createOrder, isConfigured } = require('../utils/payment');

// @desc Student views own fees
exports.getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const fees = await Fee.find({ student: student._id }).sort('-createdAt');
  res.json({ success: true, fees });
});

// @desc Create a payment order for a fee (Razorpay if configured, else mock)
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  const due = fee.amount - fee.amountPaid;
  const order = await createOrder(due, `fee_${fee._id}`);
  res.json({ success: true, order, gatewayConfigured: isConfigured, keyId: process.env.RAZORPAY_KEY_ID || null });
});

// @desc Confirm payment (in real Razorpay flow, verify signature here)
exports.confirmPayment = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  const { transactionId, amount, method } = req.body;

  fee.amountPaid += Number(amount);
  fee.status = fee.amountPaid >= fee.amount ? 'paid' : 'partial';
  fee.paymentDate = new Date();
  fee.paymentMethod = method || 'mock';
  fee.transactionId = transactionId || `TXN-${Date.now()}`;
  fee.receiptNumber = `RCPT-${fee._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  await fee.save();

  res.json({ success: true, fee });
});

// @desc Download PDF receipt
exports.downloadReceipt = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id).populate({
    path: 'student',
    populate: { path: 'user', select: 'name email' },
  });
  if (!fee || fee.status === 'unpaid') {
    res.status(404);
    throw new Error('Paid fee record not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${fee.receiptNumber}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).fillColor('#7A1315').text('CGC University Hostel', { align: 'center' });
  doc.fontSize(12).fillColor('black').text('Fee Payment Receipt', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(11);
  doc.text(`Receipt No: ${fee.receiptNumber}`);
  doc.text(`Date: ${new Date(fee.paymentDate).toLocaleString()}`);
  doc.text(`Student: ${fee.student.user.name} (${fee.student.enrollmentNo})`);
  doc.text(`Fee Type: ${fee.feeType}`);
  doc.text(`Academic Year: ${fee.academicYear} | Term: ${fee.term}`);
  doc.moveDown();
  doc.text(`Total Amount: Rs. ${fee.amount}`);
  doc.text(`Amount Paid: Rs. ${fee.amountPaid}`);
  doc.text(`Payment Method: ${fee.paymentMethod}`);
  doc.text(`Transaction ID: ${fee.transactionId}`);
  doc.moveDown(2);
  doc.fontSize(9).fillColor('gray').text('This is a system-generated receipt and does not require a signature.', { align: 'center' });

  doc.end();
});

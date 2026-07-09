const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    feeType: { type: String, enum: ['hostel', 'mess', 'security_deposit', 'other'], default: 'hostel' },
    academicYear: { type: String, required: true },
    term: { type: String, default: 'Annual' },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'overdue', 'partial'], default: 'unpaid' },
    amountPaid: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ['razorpay', 'cash', 'bank_transfer', 'mock'], default: null },
    transactionId: { type: String },
    receiptNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', FeeSchema);

const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    leaveType: { type: String, enum: ['home', 'medical', 'emergency', 'other'], default: 'home' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    contactDuringLeave: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewRemarks: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);

const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
    purpose: { type: String },
    idProofType: { type: String, enum: ['aadhar', 'pan', 'voter_id', 'driving_license', 'other'] },
    idProofNumber: { type: String },
    photo: { type: String },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { type: String, enum: ['requested', 'checked_in', 'checked_out'], default: 'requested' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', VisitorSchema);

const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNo: { type: String, required: true, unique: true, trim: true },
    course: { type: String, required: true },
    branch: { type: String },
    year: { type: Number, min: 1, max: 5 },
    semester: { type: Number, min: 1, max: 10 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dob: { type: Date },
    guardianName: { type: String },
    guardianPhone: { type: String },
    address: { type: String },
    bloodGroup: { type: String },
    applicationStatus: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied',
    },
    allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation', default: null },
    qrCode: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);

const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    bedNumber: { type: Number, required: true },
    allocatedOn: { type: Date, default: Date.now },
    vacatedOn: { type: Date, default: null },
    status: { type: String, enum: ['active', 'vacated'], default: 'active' },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Allocation', AllocationSchema);

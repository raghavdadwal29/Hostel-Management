const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

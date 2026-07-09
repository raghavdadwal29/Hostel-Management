const mongoose = require('mongoose');

const WardenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    empCode: { type: String, required: true, unique: true, trim: true },
    assignedHostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    designation: { type: String, default: 'Warden' },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warden', WardenSchema);

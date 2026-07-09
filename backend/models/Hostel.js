const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['boys', 'girls', 'co-ed'], default: 'boys' },
    totalFloors: { type: Number, default: 1 },
    warden: { type: mongoose.Schema.Types.ObjectId, ref: 'Warden' },
    address: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hostel', HostelSchema);

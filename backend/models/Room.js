const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    floor: { type: Number, required: true },
    roomNumber: { type: String, required: true, trim: true },
    roomType: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], default: 'double' },
    totalBeds: { type: Number, required: true, default: 2 },
    occupiedBeds: { type: Number, default: 0 },
    monthlyRent: { type: Number, default: 0 },
    amenities: [{ type: String }],
    status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

RoomSchema.index({ hostel: 1, floor: 1, roomNumber: 1 }, { unique: true });

RoomSchema.virtual('vacantBeds').get(function () {
  return this.totalBeds - this.occupiedBeds;
});
RoomSchema.virtual('occupancyPercentage').get(function () {
  return this.totalBeds === 0 ? 0 : Math.round((this.occupiedBeds / this.totalBeds) * 100);
});
RoomSchema.set('toJSON', { virtuals: true });
RoomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', RoomSchema);

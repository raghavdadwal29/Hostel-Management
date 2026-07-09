const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    category: {
      type: String,
      enum: ['electrical', 'plumbing', 'furniture', 'cleanliness', 'internet', 'food', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
    images: [{ type: String }],
    comments: [CommentSchema],
    resolvedAt: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);

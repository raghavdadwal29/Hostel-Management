const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', default: null }, // null = global
    audience: { type: String, enum: ['all', 'students', 'wardens'], default: 'all' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPinned: { type: Boolean, default: false },
    attachment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', NoticeSchema);

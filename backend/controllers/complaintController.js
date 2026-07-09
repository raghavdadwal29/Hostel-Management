const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const notify = require('../utils/notify');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const resolveImageUrls = async (files) => {
  if (!files || !files.length) return [];
  if (isConfigured) {
    const uploads = await Promise.all(files.map((f) => cloudinary.uploader.upload(f.path)));
    return uploads.map((u) => u.secure_url);
  }
  // local fallback - served statically from /uploads
  return files.map((f) => `/uploads/${f.filename}`);
};

// @desc Student creates a complaint
exports.createComplaint = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  const images = await resolveImageUrls(req.files);

  const complaint = await Complaint.create({
    student: student._id,
    hostel: student.allocation ? (await student.populate('allocation')).allocation?.hostel : undefined,
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority || 'medium',
    images,
  });

  res.status(201).json({ success: true, complaint });
});

// @desc Get complaints (student sees own, warden/admin see hostel/all)
exports.getComplaints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    filter.student = student._id;
  } else {
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.hostel) filter.hostel = req.query.hostel;
  }

  const complaints = await Complaint.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate('hostel', 'name')
    .sort('-createdAt');

  res.json({ success: true, count: complaints.length, complaints });
});

exports.getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate('hostel', 'name')
    .populate('comments.author', 'name role');
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  res.json({ success: true, complaint });
});

// @desc Warden/Admin updates complaint status
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate({
    path: 'student',
    populate: { path: 'user', select: 'name' },
  });
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  complaint.status = req.body.status;
  if (req.body.status === 'resolved') complaint.resolvedAt = new Date();
  if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo;
  await complaint.save();

  await notify({
    user: complaint.student.user._id,
    title: 'Complaint update',
    message: `Your complaint "${complaint.title}" is now ${complaint.status.replace('_', ' ')}.`,
  });

  res.json({ success: true, complaint });
});

// @desc Add a comment to a complaint
exports.addComment = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  complaint.comments.push({ author: req.user._id, message: req.body.message });
  await complaint.save();
  res.json({ success: true, complaint });
});

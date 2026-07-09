const asyncHandler = require('express-async-handler');
const Visitor = require('../models/Visitor');
const Student = require('../models/Student');

// @desc Student registers a visitor request
exports.registerVisitor = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('allocation');
  const visitor = await Visitor.create({
    ...req.body,
    student: student._id,
    hostel: student.allocation ? student.allocation.hostel : undefined,
  });
  res.status(201).json({ success: true, visitor });
});

// @desc List visitors (student: own, warden/admin: hostel/all)
exports.getVisitors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    filter.student = student._id;
  } else if (req.query.hostel) {
    filter.hostel = req.query.hostel;
  }
  if (req.query.status) filter.status = req.query.status;

  const visitors = await Visitor.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .sort('-createdAt');
  res.json({ success: true, count: visitors.length, visitors });
});

// @desc Warden approves/rejects a visitor
exports.reviewVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor request not found');
  }
  visitor.approvalStatus = req.body.approvalStatus;
  await visitor.save();
  res.json({ success: true, visitor });
});

// @desc Check-in a visitor
exports.checkIn = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }
  visitor.status = 'checked_in';
  visitor.checkInTime = new Date();
  await visitor.save();
  res.json({ success: true, visitor });
});

// @desc Check-out a visitor
exports.checkOut = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }
  visitor.status = 'checked_out';
  visitor.checkOutTime = new Date();
  await visitor.save();
  res.json({ success: true, visitor });
});

const asyncHandler = require('express-async-handler');
const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');
const notify = require('../utils/notify');

exports.applyLeave = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('allocation');
  const leave = await LeaveRequest.create({
    ...req.body,
    student: student._id,
    hostel: student.allocation ? student.allocation.hostel : undefined,
  });
  res.status(201).json({ success: true, leave });
});

exports.getLeaves = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    filter.student = student._id;
  } else {
    if (req.query.status) filter.status = req.query.status;
    if (req.query.hostel) filter.hostel = req.query.hostel;
  }
  const leaves = await LeaveRequest.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .sort('-createdAt');
  res.json({ success: true, count: leaves.length, leaves });
});

exports.reviewLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id).populate({
    path: 'student',
    populate: { path: 'user', select: 'name' },
  });
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  leave.status = req.body.status;
  leave.reviewRemarks = req.body.reviewRemarks;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  await notify({
    user: leave.student.user._id,
    title: `Leave request ${leave.status}`,
    message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} was ${leave.status}.`,
    type: leave.status === 'approved' ? 'success' : 'warning',
  });

  res.json({ success: true, leave });
});

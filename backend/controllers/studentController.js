const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const Student = require('../models/Student');
const Allocation = require('../models/Allocation');

// @desc Student applies for hostel accommodation
exports.applyForHostel = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  if (student.applicationStatus === 'pending' || student.applicationStatus === 'approved') {
    res.status(400);
    throw new Error('You already have an active or pending application');
  }
  Object.assign(student, req.body, { applicationStatus: 'pending' });
  await student.save();
  res.json({ success: true, student });
});

// @desc Get own profile with room details
exports.getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar')
    .populate({ path: 'allocation', populate: { path: 'room hostel' } });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  res.json({ success: true, student });
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  const { name, phone, ...studentFields } = req.body;
  Object.assign(student, studentFields);
  await student.save();

  if (name || phone) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      ...(name && { name }),
      ...(phone && { phone }),
    });
  }
  res.json({ success: true, student });
});

// @desc Generate/fetch a QR code encoding the student's ID card info
exports.getMyQrCode = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', 'name');
  const payload = JSON.stringify({
    id: student._id,
    enrollmentNo: student.enrollmentNo,
    name: student.user.name,
  });
  const qrDataUrl = await QRCode.toDataURL(payload);
  student.qrCode = qrDataUrl;
  await student.save();
  res.json({ success: true, qrCode: qrDataUrl });
});

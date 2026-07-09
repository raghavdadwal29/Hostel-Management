const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  code: user.code,
  avatar: user.avatar,
  theme: user.theme,
});

// @desc  Register a new student (self-registration). Admins/wardens are created by Admin.
// @route POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, enrollmentNo, course, branch, gender } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const codeExists = await User.findOne({ code: enrollmentNo });
  if (codeExists) {
    res.status(400);
    throw new Error('An account with this enrollment number already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'student',
    code: enrollmentNo,
  });

  await Student.create({
    user: user._id,
    enrollmentNo,
    course,
    branch,
    gender,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

// @desc  Login for admin, warden, or student using code (roll/enrollment/emp) or email
// @route POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Please provide login identifier and password');
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { code: identifier }],
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact administration.');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

// @desc  Get current logged in user
// @route GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'student') {
    profile = await Student.findOne({ user: req.user._id });
  } else if (req.user.role === 'warden') {
    profile = await Warden.findOne({ user: req.user._id }).populate('assignedHostel', 'name code type');
  }
  res.json({ success: true, user: sanitizeUser(req.user), profile });
});

// @desc  Update password while logged in
// @route PUT /api/auth/update-password
// @access Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, token: generateToken(user._id), message: 'Password updated successfully' });
});

// @desc  Forgot password - sends reset link via email
// @route POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('No account found with that email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below (valid for 30 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`;

  try {
    await sendEmail({ to: user.email, subject: 'CGC Hostel - Password Reset', html, text: resetUrl });
    res.json({ success: true, message: 'Password reset link sent to email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc  Reset password using token from email
// @route PUT /api/auth/reset-password/:token
// @access Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), message: 'Password reset successful' });
});

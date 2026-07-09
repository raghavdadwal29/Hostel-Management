const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');

exports.createNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, notice });
});

exports.getNotices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hostel) filter.$or = [{ hostel: req.query.hostel }, { hostel: null }];
  if (req.user.role === 'student') filter.audience = { $in: ['all', 'students'] };
  if (req.user.role === 'warden') filter.audience = { $in: ['all', 'wardens'] };

  const notices = await Notice.find(filter).populate('postedBy', 'name role').sort('-isPinned -createdAt');
  res.json({ success: true, count: notices.length, notices });
});

exports.updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  res.json({ success: true, notice });
});

exports.deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  await notice.deleteOne();
  res.json({ success: true, message: 'Notice removed' });
});

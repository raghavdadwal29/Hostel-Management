const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Allocation = require('../models/Allocation');

// @desc Warden marks daily attendance for a hostel (bulk)
// body: { hostelId, date, records: [{ studentId, status, remarks }] }
exports.markAttendance = asyncHandler(async (req, res) => {
  const { hostelId, date, records } = req.body;
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    records.map(async ({ studentId, status, remarks }) => {
      return Attendance.findOneAndUpdate(
        { student: studentId, date: day },
        { student: studentId, hostel: hostelId, date: day, status, remarks, markedBy: req.user._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );
  res.status(201).json({ success: true, count: results.length, attendance: results });
});

// @desc Get attendance list (filter by hostel/date/student)
exports.getAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    filter.student = student._id;
  } else {
    if (req.query.hostel) filter.hostel = req.query.hostel;
    if (req.query.student) filter.student = req.query.student;
  }
  if (req.query.date) {
    const day = new Date(req.query.date);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    filter.date = { $gte: day, $lt: next };
  } else if (req.query.month && req.query.year) {
    const start = new Date(Number(req.query.year), Number(req.query.month) - 1, 1);
    const end = new Date(Number(req.query.year), Number(req.query.month), 1);
    filter.date = { $gte: start, $lt: end };
  }

  const attendance = await Attendance.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .sort('-date');
  res.json({ success: true, count: attendance.length, attendance });
});

// @desc Monthly attendance statistics per student or hostel
exports.getMonthlyStats = asyncHandler(async (req, res) => {
  const { year, month, hostel } = req.query;
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);

  const filter = { date: { $gte: start, $lt: end } };
  if (hostel) filter.hostel = hostel;

  const stats = await Attendance.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$student',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);

  const populated = await Student.populate(stats, { path: '_id', populate: { path: 'user', select: 'name' } });
  const result = populated.map((s) => ({
    student: s._id,
    present: s.present,
    absent: s.absent,
    leave: s.leave,
    total: s.total,
    percentage: s.total ? Math.round((s.present / s.total) * 100) : 0,
  }));

  res.json({ success: true, stats: result });
});

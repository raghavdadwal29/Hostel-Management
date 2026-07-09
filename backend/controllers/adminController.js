const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const ApiFeatures = require('../utils/apiFeatures');
const notify = require('../utils/notify');

// ---------------- DASHBOARD ----------------
// @desc Admin dashboard statistics
// @route GET /api/admin/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalRooms, rooms, pendingComplaints, pendingApplications] = await Promise.all([
    Student.countDocuments(),
    Room.countDocuments(),
    Room.find({}),
    Complaint.countDocuments({ status: 'pending' }),
    Student.countDocuments({ applicationStatus: 'pending' }),
  ]);

  const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
  const occupiedRooms = rooms.filter((r) => r.occupiedBeds >= r.totalBeds).length;
  const vacantRooms = totalRooms - occupiedRooms;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyFees = await Fee.aggregate([
    { $match: { paymentDate: { $gte: startOfMonth }, status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ]);

  const totalAttendanceRecords = await Attendance.countDocuments({
    date: { $gte: startOfMonth },
  });
  const presentRecords = await Attendance.countDocuments({
    date: { $gte: startOfMonth },
    status: 'present',
  });
  const attendancePercentage = totalAttendanceRecords
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 0;

  // last 6 months fee collection trend
  const monthlyTrend = await Fee.aggregate([
    { $match: { status: 'paid', paymentDate: { $ne: null } } },
    {
      $group: {
        _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
        total: { $sum: '$amountPaid' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  const complaintsByCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalBeds,
      occupiedBeds,
      vacantBeds: totalBeds - occupiedBeds,
      pendingComplaints,
      pendingApplications,
      monthlyFeeCollection: monthlyFees[0]?.total || 0,
      attendancePercentage,
      monthlyTrend: monthlyTrend.reverse(),
      complaintsByCategory,
    },
  });
});

// ---------------- STUDENTS ----------------
exports.getStudents = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Student.find().populate('user', 'name email phone isActive').populate({
      path: 'allocation',
      populate: { path: 'room hostel' },
    }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const students = await features.query;
  const total = await Student.countDocuments();
  res.json({ success: true, count: students.length, total, students });
});

exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'name email phone isActive avatar')
    .populate({ path: 'allocation', populate: { path: 'room hostel' } });
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.json({ success: true, student });
});

exports.createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, phone, enrollmentNo, course, branch, year, semester, gender } = req.body;
  const user = await User.create({ name, email, password, phone, role: 'student', code: enrollmentNo });
  const student = await Student.create({ user: user._id, enrollmentNo, course, branch, year, semester, gender });
  res.status(201).json({ success: true, student });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  Object.assign(student, req.body);
  await student.save();

  if (req.body.name || req.body.phone || req.body.isActive !== undefined) {
    await User.findByIdAndUpdate(student.user, {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
    });
  }
  res.json({ success: true, student });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  await User.findByIdAndDelete(student.user);
  await student.deleteOne();
  res.json({ success: true, message: 'Student removed' });
});

// ---------------- HOSTEL APPLICATIONS ----------------
exports.getApplications = asyncHandler(async (req, res) => {
  const status = req.query.status || 'pending';
  const students = await Student.find({ applicationStatus: status }).populate('user', 'name email phone');
  res.json({ success: true, students });
});

exports.reviewApplication = asyncHandler(async (req, res) => {
  const { status } = req.body; // approved | rejected
  const student = await Student.findById(req.params.id).populate('user', 'name email');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  student.applicationStatus = status;
  await student.save();
  await notify({
    user: student.user._id,
    title: `Hostel application ${status}`,
    message: `Your hostel accommodation application has been ${status}.`,
    type: status === 'approved' ? 'success' : 'warning',
  });
  res.json({ success: true, student });
});

// ---------------- WARDENS ----------------
exports.getWardens = asyncHandler(async (req, res) => {
  const wardens = await Warden.find().populate('user', 'name email phone isActive').populate('assignedHostel', 'name code');
  res.json({ success: true, count: wardens.length, wardens });
});

exports.createWarden = asyncHandler(async (req, res) => {
  const { name, email, password, phone, empCode, assignedHostel, designation } = req.body;
  const user = await User.create({ name, email, password, phone, role: 'warden', code: empCode });
  const warden = await Warden.create({ user: user._id, empCode, assignedHostel, designation });
  if (assignedHostel) {
    await Hostel.findByIdAndUpdate(assignedHostel, { warden: warden._id });
  }
  res.status(201).json({ success: true, warden });
});

exports.updateWarden = asyncHandler(async (req, res) => {
  const warden = await Warden.findById(req.params.id);
  if (!warden) {
    res.status(404);
    throw new Error('Warden not found');
  }
  Object.assign(warden, req.body);
  await warden.save();
  if (req.body.assignedHostel) {
    await Hostel.findByIdAndUpdate(req.body.assignedHostel, { warden: warden._id });
  }
  res.json({ success: true, warden });
});

exports.deleteWarden = asyncHandler(async (req, res) => {
  const warden = await Warden.findById(req.params.id);
  if (!warden) {
    res.status(404);
    throw new Error('Warden not found');
  }
  await User.findByIdAndDelete(warden.user);
  await warden.deleteOne();
  res.json({ success: true, message: 'Warden removed' });
});

// ---------------- FEE STRUCTURE / OVERVIEW ----------------
exports.getAllFees = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Fee.find().populate({ path: 'student', populate: { path: 'user', select: 'name email' } }).populate('hostel', 'name'),
    req.query
  )
    .filter()
    .sort()
    .paginate();
  const fees = await features.query;
  const total = await Fee.countDocuments();
  res.json({ success: true, count: fees.length, total, fees });
});

exports.generateFee = asyncHandler(async (req, res) => {
  const { studentIds, feeType, academicYear, term, amount, dueDate, hostel } = req.body;
  const records = await Promise.all(
    studentIds.map((studentId) =>
      Fee.create({ student: studentId, hostel, feeType, academicYear, term, amount, dueDate })
    )
  );
  await Promise.all(
    records.map(async (fee) => {
      const student = await Student.findById(fee.student);
      if (student) {
        await notify({
          user: student.user,
          title: 'New fee generated',
          message: `A ${feeType} fee of ₹${amount} has been generated. Due on ${new Date(dueDate).toLocaleDateString()}.`,
        });
      }
    })
  );
  res.status(201).json({ success: true, count: records.length, fees: records });
});

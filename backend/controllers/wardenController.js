const asyncHandler = require('express-async-handler');
const Warden = require('../models/Warden');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');
const Allocation = require('../models/Allocation');

// @desc Warden dashboard - stats scoped to their assigned hostel
exports.getDashboard = asyncHandler(async (req, res) => {
  const warden = await Warden.findOne({ user: req.user._id }).populate('assignedHostel');
  if (!warden || !warden.assignedHostel) {
    return res.json({
      success: true,
      hostel: null,
      stats: { totalStudents: 0, totalRooms: 0, occupiedBeds: 0, vacantBeds: 0, pendingComplaints: 0, pendingLeaves: 0 },
    });
  }

  const hostelId = warden.assignedHostel._id;
  const rooms = await Room.find({ hostel: hostelId });
  const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
  const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);

  const [totalStudents, pendingComplaints, pendingLeaves] = await Promise.all([
    Allocation.countDocuments({ hostel: hostelId, status: 'active' }),
    Complaint.countDocuments({ hostel: hostelId, status: 'pending' }),
    LeaveRequest.countDocuments({ hostel: hostelId, status: 'pending' }),
  ]);

  res.json({
    success: true,
    hostel: warden.assignedHostel,
    stats: {
      totalStudents,
      totalRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      vacantBeds: totalBeds - occupiedBeds,
      pendingComplaints,
      pendingLeaves,
    },
  });
});

// @desc Get students residing in the warden's assigned hostel (for attendance marking etc.)
exports.getMyStudents = asyncHandler(async (req, res) => {
  const warden = await Warden.findOne({ user: req.user._id });
  if (!warden || !warden.assignedHostel) {
    return res.json({ success: true, students: [] });
  }
  const allocations = await Allocation.find({ hostel: warden.assignedHostel, status: 'active' })
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate('room', 'roomNumber');
  const students = allocations.map((a) => ({ ...a.student.toObject(), room: a.room }));
  res.json({ success: true, students, hostelId: warden.assignedHostel });
});

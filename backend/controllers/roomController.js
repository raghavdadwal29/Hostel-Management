const asyncHandler = require('express-async-handler');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const Student = require('../models/Student');
const notify = require('../utils/notify');

// ---------------- HOSTELS ----------------
exports.getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find().populate('warden', 'empCode').populate({
    path: 'warden',
    populate: { path: 'user', select: 'name email' },
  });
  res.json({ success: true, count: hostels.length, hostels });
});

exports.createHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.create(req.body);
  res.status(201).json({ success: true, hostel });
});

exports.updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hostel) {
    res.status(404);
    throw new Error('Hostel not found');
  }
  res.json({ success: true, hostel });
});

exports.deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    res.status(404);
    throw new Error('Hostel not found');
  }
  await hostel.deleteOne();
  res.json({ success: true, message: 'Hostel removed' });
});

// ---------------- ROOMS ----------------
exports.getRooms = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hostel) filter.hostel = req.query.hostel;
  if (req.query.floor) filter.floor = req.query.floor;
  const rooms = await Room.find(filter).populate('hostel', 'name code');
  res.json({ success: true, count: rooms.length, rooms });
});

exports.createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, room });
});

exports.updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
  res.json({ success: true, room });
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
  await room.deleteOne();
  res.json({ success: true, message: 'Room removed' });
});

// ---------------- ALLOCATION ----------------
exports.allocateRoom = asyncHandler(async (req, res) => {
  const { studentId, roomId } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
  if (room.occupiedBeds >= room.totalBeds) {
    res.status(400);
    throw new Error('Room is already full');
  }

  const student = await Student.findById(studentId).populate('user', 'name');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  if (student.allocation) {
    res.status(400);
    throw new Error('Student already has an active room allocation');
  }

  const bedNumber = room.occupiedBeds + 1;
  const allocation = await Allocation.create({
    student: studentId,
    room: roomId,
    hostel: room.hostel,
    bedNumber,
    allocatedBy: req.user._id,
  });

  room.occupiedBeds += 1;
  await room.save();

  student.allocation = allocation._id;
  student.applicationStatus = 'approved';
  await student.save();

  await notify({
    user: student.user._id,
    title: 'Room allocated',
    message: `You have been allocated Room ${room.roomNumber}, Bed ${bedNumber}.`,
    type: 'success',
  });

  res.status(201).json({ success: true, allocation });
});

exports.deallocateRoom = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id).populate('student');
  if (!allocation || allocation.status === 'vacated') {
    res.status(404);
    throw new Error('Active allocation not found');
  }

  allocation.status = 'vacated';
  allocation.vacatedOn = new Date();
  await allocation.save();

  const room = await Room.findById(allocation.room);
  if (room) {
    room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
    await room.save();
  }

  await Student.findByIdAndUpdate(allocation.student._id, { allocation: null });

  res.json({ success: true, message: 'Room deallocated successfully' });
});

exports.getAllocations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const allocations = await Allocation.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate('room')
    .populate('hostel', 'name code');
  res.json({ success: true, count: allocations.length, allocations });
});

// @desc Occupancy overview by hostel
exports.getOccupancy = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find();
  const data = await Promise.all(
    hostels.map(async (hostel) => {
      const rooms = await Room.find({ hostel: hostel._id });
      const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
      const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
      return {
        hostel: hostel.name,
        hostelId: hostel._id,
        totalRooms: rooms.length,
        totalBeds,
        occupiedBeds,
        vacantBeds: totalBeds - occupiedBeds,
        occupancyPercentage: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      };
    })
  );
  res.json({ success: true, occupancy: data });
});

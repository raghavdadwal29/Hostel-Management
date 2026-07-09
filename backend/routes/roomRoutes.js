const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const room = require('../controllers/roomController');

// Read access for admin + warden; writes for admin only
router.get('/hostels', protect, room.getHostels);
router.post('/hostels', protect, authorize('admin'), room.createHostel);
router.put('/hostels/:id', protect, authorize('admin'), room.updateHostel);
router.delete('/hostels/:id', protect, authorize('admin'), room.deleteHostel);

router.get('/rooms', protect, room.getRooms);
router.post('/rooms', protect, authorize('admin'), room.createRoom);
router.put('/rooms/:id', protect, authorize('admin'), room.updateRoom);
router.delete('/rooms/:id', protect, authorize('admin'), room.deleteRoom);

router.get('/occupancy', protect, authorize('admin', 'warden'), room.getOccupancy);

router.get('/allocations', protect, authorize('admin', 'warden'), room.getAllocations);
router.post('/allocations', protect, authorize('admin'), room.allocateRoom);
router.put('/allocations/:id/deallocate', protect, authorize('admin'), room.deallocateRoom);

module.exports = router;

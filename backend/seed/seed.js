// Seed script - populates the database with sample data for testing/demo.
// Run with: npm run seed
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Notice = require('../models/Notice');
const Fee = require('../models/Fee');

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Warden.deleteMany(),
    Hostel.deleteMany(),
    Room.deleteMany(),
    Notice.deleteMany(),
    Fee.deleteMany(),
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'Dr. Admin Sharma',
    email: 'admin@cgc.edu.in',
    password: 'Admin@123',
    role: 'admin',
    code: 'ADM001',
    phone: '9876500001',
  });

  console.log('Creating hostels...');
  const hostelBoys = await Hostel.create({
    name: 'Sukhna Boys Hostel',
    code: 'SBH',
    type: 'boys',
    totalFloors: 4,
    address: 'CGC University Campus, Mohali',
  });
  const hostelGirls = await Hostel.create({
    name: 'Kasauli Girls Hostel',
    code: 'KGH',
    type: 'girls',
    totalFloors: 3,
    address: 'CGC University Campus, Mohali',
  });

  console.log('Creating wardens...');
  const wardenUser1 = await User.create({
    name: 'Mr. Rajesh Kumar',
    email: 'warden1@cgc.edu.in',
    password: 'Warden@123',
    role: 'warden',
    code: 'EMP101',
    phone: '9876500002',
  });
  const warden1 = await Warden.create({
    user: wardenUser1._id,
    empCode: 'EMP101',
    assignedHostel: hostelBoys._id,
    designation: 'Chief Warden',
  });
  hostelBoys.warden = warden1._id;
  await hostelBoys.save();

  const wardenUser2 = await User.create({
    name: 'Mrs. Anita Verma',
    email: 'warden2@cgc.edu.in',
    password: 'Warden@123',
    role: 'warden',
    code: 'EMP102',
    phone: '9876500003',
  });
  const warden2 = await Warden.create({
    user: wardenUser2._id,
    empCode: 'EMP102',
    assignedHostel: hostelGirls._id,
    designation: 'Warden',
  });
  hostelGirls.warden = warden2._id;
  await hostelGirls.save();

  console.log('Creating rooms...');
  const roomsData = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let num = 1; num <= 4; num++) {
      roomsData.push({
        hostel: hostelBoys._id,
        floor,
        roomNumber: `B${floor}0${num}`,
        roomType: 'double',
        totalBeds: 2,
        monthlyRent: 6000,
        amenities: ['Wi-Fi', 'Attached Washroom', 'Study Table'],
      });
      roomsData.push({
        hostel: hostelGirls._id,
        floor,
        roomNumber: `G${floor}0${num}`,
        roomType: 'double',
        totalBeds: 2,
        monthlyRent: 6000,
        amenities: ['Wi-Fi', 'Attached Washroom', 'Study Table'],
      });
    }
  }
  await Room.insertMany(roomsData);

  console.log('Creating sample students...');
  const students = [
    { name: 'Aman Preet Singh', email: 'aman.student@cgc.edu.in', enrollmentNo: '2101CS001', course: 'B.Tech', branch: 'CSE', gender: 'male' },
    { name: 'Simran Kaur', email: 'simran.student@cgc.edu.in', enrollmentNo: '2101CS002', course: 'B.Tech', branch: 'CSE', gender: 'female' },
    { name: 'Rohit Sharma', email: 'rohit.student@cgc.edu.in', enrollmentNo: '2101ME001', course: 'B.Tech', branch: 'ME', gender: 'male' },
  ];

  for (const s of students) {
    const u = await User.create({
      name: s.name,
      email: s.email,
      password: 'Student@123',
      role: 'student',
      code: s.enrollmentNo,
      phone: '98765xxxxx',
    });
    await Student.create({
      user: u._id,
      enrollmentNo: s.enrollmentNo,
      course: s.course,
      branch: s.branch,
      year: 2,
      semester: 3,
      gender: s.gender,
      applicationStatus: 'not_applied',
    });
  }

  console.log('Creating notices...');
  await Notice.create([
    {
      title: 'Hostel Fee Deadline Extended',
      content: 'The last date for hostel fee submission has been extended to the 15th of this month.',
      audience: 'students',
      postedBy: admin._id,
      isPinned: true,
    },
    {
      title: 'Diwali Vacation Notice',
      content: 'The hostel will remain open during the Diwali break for outstation students who register in advance.',
      audience: 'all',
      postedBy: admin._id,
    },
  ]);

  console.log('\n✅ Seed data created successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin   -> Code: ADM001  | Password: Admin@123');
  console.log('  Warden  -> Code: EMP101  | Password: Warden@123');
  console.log('  Student -> Code: 2101CS001 | Password: Student@123\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

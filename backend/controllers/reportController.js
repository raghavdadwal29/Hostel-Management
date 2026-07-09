const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');

// @desc Export students as CSV
exports.exportStudentsCsv = asyncHandler(async (req, res) => {
  const students = await Student.find().populate('user', 'name email phone');
  const rows = students.map((s) => ({
    Name: s.user?.name,
    Email: s.user?.email,
    Phone: s.user?.phone,
    EnrollmentNo: s.enrollmentNo,
    Course: s.course,
    Branch: s.branch,
    Year: s.year,
    ApplicationStatus: s.applicationStatus,
  }));
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students-report.csv');
  res.send(csv);
});

// @desc Export fee collection as CSV
exports.exportFeesCsv = asyncHandler(async (req, res) => {
  const fees = await Fee.find().populate({ path: 'student', populate: { path: 'user', select: 'name' } });
  const rows = fees.map((f) => ({
    Student: f.student?.user?.name,
    EnrollmentNo: f.student?.enrollmentNo,
    FeeType: f.feeType,
    AcademicYear: f.academicYear,
    Amount: f.amount,
    AmountPaid: f.amountPaid,
    Status: f.status,
    DueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '',
    PaymentDate: f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : '',
  }));
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fees-report.csv');
  res.send(csv);
});

// @desc Export a general PDF summary report
exports.exportSummaryPdf = asyncHandler(async (req, res) => {
  const [totalStudents, pendingComplaints, resolvedComplaints, totalFeesCollected] = await Promise.all([
    Student.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amountPaid' } } }]),
  ]);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=hostel-summary-report.pdf');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).fillColor('#7A1315').text('CGC University Hostel', { align: 'center' });
  doc.fontSize(14).fillColor('black').text('Management Summary Report', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12);
  doc.text(`Report generated on: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Students: ${totalStudents}`);
  doc.text(`Pending Complaints: ${pendingComplaints}`);
  doc.text(`Resolved Complaints: ${resolvedComplaints}`);
  doc.text(`Total Fees Collected: Rs. ${totalFeesCollected[0]?.total || 0}`);
  doc.end();
});

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { tharunGetDateOnly, tharunComputeStatus, tharunComputeTotalHours } = require('../utils/tharunAttendanceLogic');

async function tharunSeedRun() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Attendance.deleteMany({});

  const manager = await User.create({
    name: 'Alex Manager',
    email: 'manager@company.com',
    password: 'manager123',
    role: 'manager',
    department: 'Operations',
  });

  const empData = [
    { name: 'John Doe', email: 'john@company.com', password: 'employee123', role: 'employee', employeeId: 'EMP001', department: 'Engineering' },
    { name: 'Jane Smith', email: 'jane@company.com', password: 'employee123', role: 'employee', employeeId: 'EMP002', department: 'Design' },
    { name: 'Bob Wilson', email: 'bob@company.com', password: 'employee123', role: 'employee', employeeId: 'EMP003', department: 'Engineering' },
    { name: 'Alice Brown', email: 'alice@company.com', password: 'employee123', role: 'employee', employeeId: 'EMP004', department: 'Marketing' },
  ];
  const employees = [];
  for (const e of empData) {
    employees.push(await User.create(e));
  }

  const today = new Date();
  const attendances = [];

  for (let d = -14; d <= 0; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateOnly = tharunGetDateOnly(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (const emp of employees) {
      if (isWeekend && Math.random() > 0.3) continue;
      const checkIn = new Date(dateOnly);
      checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const checkOut = new Date(checkIn);
      checkOut.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      if (Math.random() > 0.85) {
        checkIn.setHours(10, 30, 0, 0);
      }
      const status = tharunComputeStatus(checkIn);
      const totalHours = tharunComputeTotalHours(checkIn, checkOut);
      attendances.push({
        userId: emp._id,
        date: dateOnly,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status,
        totalHours,
      });
    }
  }

  await Attendance.insertMany(attendances);
  console.log('Seed done. Manager: manager@company.com / manager123');
  console.log('Employees: john@company.com, jane@company.com, bob@company.com, alice@company.com / employee123');
  await mongoose.disconnect();
}

tharunSeedRun().catch((e) => {
  console.error(e);
  process.exit(1);
});

const Attendance = require('../models/Attendance');
const User = require('../models/User');
const {
  tharunGetDateOnly,
  tharunComputeStatus,
  tharunComputeTotalHours,
} = require('../utils/tharunAttendanceLogic');

exports.tharunCheckIn = async (req, res) => {
  try {
    const today = tharunGetDateOnly(new Date());
    let record = await Attendance.findOne({ userId: req.user._id, date: today });
    if (record && record.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }
    const now = new Date();
    if (!record) {
      record = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkInTime: now,
        status: tharunComputeStatus(now),
      });
    } else {
      record.checkInTime = now;
      record.status = tharunComputeStatus(now);
      await record.save();
    }
    res.json({ success: true, attendance: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunCheckOut = async (req, res) => {
  try {
    const today = tharunGetDateOnly(new Date());
    const record = await Attendance.findOne({ userId: req.user._id, date: today });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }
    const now = new Date();
    record.checkOutTime = now;
    record.totalHours = tharunComputeTotalHours(record.checkInTime, now);
    await record.save();
    res.json({ success: true, attendance: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunMyHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const list = await Attendance.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunMySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const y = year ? Number(year) : new Date().getFullYear();
    const m = month ? Number(month) : new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const list = await Attendance.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).lean();
    const present = list.filter((a) => a.status === 'present').length;
    const absent = list.filter((a) => a.status === 'absent').length;
    const late = list.filter((a) => a.status === 'late').length;
    const halfDay = list.filter((a) => a.status === 'half-day').length;
    const totalHours = list.reduce((s, a) => s + (a.totalHours || 0), 0);
    res.json({
      success: true,
      summary: { present, absent, late, halfDay, totalHours, days: list.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunTodayStatus = async (req, res) => {
  try {
    const today = tharunGetDateOnly(new Date());
    const record = await Attendance.findOne({ userId: req.user._id, date: today }).lean();
    res.json({
      success: true,
      today: record || null,
      checkedIn: !!(record && record.checkInTime),
      checkedOut: !!(record && record.checkOutTime),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunAllAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const filter = {};
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) filter.userId = user._id;
    }
    if (startDate && endDate) {
      filter.date = {
        $gte: tharunGetDateOnly(new Date(startDate)),
        $lte: new Date(endDate + 'T23:59:59'),
      };
    }
    if (status) filter.status = status;
    const list = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await Attendance.find({ userId: id })
      .sort({ date: -1 })
      .lean();
    const user = await User.findById(id).select('name email employeeId department').lean();
    res.json({ success: true, data: list, user: user || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunTeamSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: tharunGetDateOnly(new Date(startDate)),
        $lte: new Date(endDate + 'T23:59:59'),
      };
    }
    const list = await Attendance.find(filter)
      .populate('userId', 'name employeeId department')
      .lean();
    const byUser = {};
    list.forEach((a) => {
      const uid = a.userId?._id?.toString() || a.userId;
      if (!byUser[uid]) byUser[uid] = { user: a.userId, present: 0, absent: 0, late: 0, halfDay: 0 };
      if (a.status === 'present') byUser[uid].present++;
      else if (a.status === 'absent') byUser[uid].absent++;
      else if (a.status === 'late') byUser[uid].late++;
      else byUser[uid].halfDay++;
    });
    res.json({ success: true, summary: Object.values(byUser) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunExportCsv = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const filter = {};
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) filter.userId = user._id;
    }
    if (startDate && endDate) {
      filter.date = {
        $gte: tharunGetDateOnly(new Date(startDate)),
        $lte: new Date(endDate + 'T23:59:59'),
      };
    }
    const list = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: 1 })
      .lean();
    const headers = 'Date,Employee ID,Name,Department,Check In,Check Out,Status,Total Hours\n';
    const rows = list.map(
      (a) =>
        `${new Date(a.date).toISOString().split('T')[0]},${a.userId?.employeeId || ''},${a.userId?.name || ''},${a.userId?.department || ''},${a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : ''},${a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : ''},${a.status},${a.totalHours || 0}`
    );
    const csv = headers + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-export.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunTodayStatusAll = async (req, res) => {
  try {
    const today = tharunGetDateOnly(new Date());
    const list = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department')
      .lean();
    const present = list.filter((a) => a.checkInTime).length;
    const employees = await User.countDocuments({ role: 'employee' });
    const absent = employees - present;
    const late = list.filter((a) => a.status === 'late').length;
    res.json({
      success: true,
      present,
      absent,
      late,
      list: list.map((a) => ({
        ...a,
        checkedIn: !!a.checkInTime,
        checkedOut: !!a.checkOutTime,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

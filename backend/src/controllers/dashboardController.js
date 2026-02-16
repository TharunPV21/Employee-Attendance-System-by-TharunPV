const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { tharunGetDateOnly } = require('../utils/tharunAttendanceLogic');

exports.tharunEmployeeDashboard = async (req, res) => {
  try {
    const today = tharunGetDateOnly(new Date());
    const todayRecord = await Attendance.findOne({ userId: req.user._id, date: today }).lean();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthRecords = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();
    const present = monthRecords.filter((r) => r.status === 'present').length;
    const absent = monthRecords.filter((r) => r.status === 'absent').length;
    const late = monthRecords.filter((r) => r.status === 'late').length;
    const totalHours = monthRecords.reduce((s, r) => s + (r.totalHours || 0), 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: today },
    })
      .sort({ date: -1 })
      .limit(7)
      .lean();
    res.json({
      success: true,
      today: todayRecord,
      checkedIn: !!(todayRecord && todayRecord.checkInTime),
      checkedOut: !!(todayRecord && todayRecord.checkOutTime),
      monthStats: { present, absent, late, totalHours },
      recent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunManagerDashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const today = tharunGetDateOnly(new Date());
    const todayRecords = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department')
      .lean();
    const presentToday = todayRecords.filter((r) => r.checkInTime).length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayRecords.filter((r) => r.status === 'late').length;
    const absentList = await User.find({ role: 'employee' })
      .select('name employeeId department')
      .lean();
    const presentIds = new Set(todayRecords.filter((r) => r.checkInTime).map((r) => r.userId?._id?.toString()));
    const absentEmployees = absentList.filter((u) => !presentIds.has(u._id.toString()));

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weeklyAgg = await Attendance.aggregate([
      { $match: { date: { $gte: weekStart, $lte: today } } },
      { $group: { _id: '$date', present: { $sum: 1 }, late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    const deptAgg = await Attendance.aggregate([
      { $match: { date: today } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $group: { _id: '$u.department', present: { $sum: { $cond: [{ $ne: ['$checkInTime', null] }, 1, 0] } } } },
    ]);

    res.json({
      success: true,
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      absentEmployees,
      weeklyTrend: weeklyAgg,
      departmentWise: deptAgg,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const User = require('../models/User');
const { tharunSignToken } = require('../utils/tharunJwtHelper');

const tharunGenerateEmployeeId = async () => {
  const last = await User.findOne({ role: 'employee' }).sort({ employeeId: -1 });
  if (!last || !last.employeeId) return 'EMP001';
  const num = parseInt(last.employeeId.replace(/\D/g, ''), 10) + 1;
  return `EMP${String(num).padStart(3, '0')}`;
};

exports.tharunRegister = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const employeeId = role === 'employee' ? await tharunGenerateEmployeeId() : undefined;
    const user = await User.create({
      name,
      email,
      password,
      role,
      employeeId,
      department: department || '',
    });
    const token = tharunSignToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await user.tharunComparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = tharunSignToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.tharunGetMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const tharunSignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const tharunVerifyAndGetUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  return user;
};

module.exports = { tharunSignToken, tharunVerifyAndGetUser };

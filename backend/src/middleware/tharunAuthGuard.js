const { tharunVerifyAndGetUser } = require('../utils/tharunJwtHelper');

const tharunAuthGuard = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const user = await tharunVerifyAndGetUser(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }
};

const tharunManagerOnly = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Manager access required' });
  }
  next();
};

module.exports = { tharunAuthGuard, tharunManagerOnly };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBMode, getStore } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusone_ai_jwt_secret_secure_key_12984712');

      if (getDBMode()) {
        const store = getStore();
        const user = store.users.find(u => u._id.toString() === decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        // Exclude password field for safety
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
      }
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

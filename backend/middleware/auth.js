// JWT Authentication & Role-based Authorization Middleware
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * authenticate - verifies JWT from Authorization: Bearer <token> header
 * Attaches decoded user payload to req.user on success
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * authorize - middleware factory that restricts access to specified roles
 * Usage: authorize('admin'), authorize('donor', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

// Middleware to restrict access to admin users only
// Must be used AFTER the 'protect' middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { admin };

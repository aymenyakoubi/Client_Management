// /middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the Authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the token from the Bearer scheme
  const token = authHeader.split(' ')[1];
  
  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: 'Token not found' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

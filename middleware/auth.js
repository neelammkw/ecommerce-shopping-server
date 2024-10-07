const jwt = require('jsonwebtoken');
const {User} = require('../models/User'); // Adjust the path as needed

const authMiddleware = async (req, res, next) => {
  // Check if the Authorization header exists
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Find the user by the decoded token ID and exclude the password field
    req.user = await User.findById(decoded.id).select('-password');
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;

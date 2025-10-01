import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data and conditionally populate company for recruiters
    const user = await User.findById(decoded.id)
      .select('+role +company');  // Explicitly include role and company
    
    // Only populate company for recruiters
    if (user && user.role === 'Recruiter') {
      await user.populate('company');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User Role:', user.role); // Debug log
    console.log('User Company:', user.company); // Debug log

    if (user.role !== 'Recruiter' && req.path.includes('/jobs')) {
      return res.status(403).json({ message: 'Only recruiters can access this route' });
    }

    // Attach complete user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
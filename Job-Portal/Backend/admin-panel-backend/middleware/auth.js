// middleware/auth.js
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  // Hardcoded static token (matches LoginPage.jsx)
  const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiZXhwIjoxNzQzNjQ4MDAwLCJpYXQiOjE3MTEyMTI2NjB9.k8vXz7z8z9zAzBzCzDzEzFzGzHzIzJzKzLzMzNzOzP';

  try {
    if (token === staticToken) {
      req.user = { id: 'admin' }; // Simulate decoded payload
      return next();
    }

    // Fallback to JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export default auth;
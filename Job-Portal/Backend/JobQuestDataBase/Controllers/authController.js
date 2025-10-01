import User from '../models/Users.js';
import Resume from '../models/Resume.js';
import Company from '../models/Company.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.matchPassword) {
      return res.status(500).json({ message: 'Server configuration error: matchPassword not implemented' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let isProfileComplete = false;
    let redirectPath = '/';

    if (user.role === 'Job Seeker') {
      const resume = await Resume.findOne({ userId: user._id });
      isProfileComplete = Boolean(resume);
      redirectPath = isProfileComplete ? '/jobs' : '/resume-builder';
    } else if (user.role === 'Recruiter') {
      const company = await Company.findOne({ userId: user._id });
      isProfileComplete = Boolean(company);
      redirectPath = isProfileComplete ? '/recruiter-dashboard' : '/company-setup';
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        company: user.company || null,
        isProfileComplete,
        redirectPath,
        firstLogin: !isProfileComplete
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export default {
  loginUser,
};
import express from 'express';
import User from '../models/Users.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { forgotPassword } from '../Controllers/forgotPasswordController.js';
import passport from 'passport';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Middleware to protect routes
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup
router.post('/signup', upload.fields([{ name: 'profilePicture' }, { name: 'companyLogo' }]), async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, companyName, companyDescription } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profilePicture: req.files?.profilePicture
        ? `/uploads/profiles/${req.files.profilePicture[0].filename}`
        : '/uploads/profiles/default-profile.jpg',
    };

    if (role === 'Job Seeker') {
      userData.resume = {
        fullName,
        email,
        phoneNumber,
        education: [],
        experience: [],
        skills: [],
      };
    } else if (role === 'Recruiter') {
      if (!companyName || !companyDescription) {
        return res.status(400).json({ message: 'Company name and description are required for recruiters' });
      }
      userData.company = {
        name: companyName,
        description: companyDescription,
        logo: req.files?.companyLogo
          ? `/uploads/profiles/${req.files.companyLogo[0].filename}`
          : '/uploads/profiles/default-company.jpg',
      };
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1y',
    });

    res.status(201).json({
      token,
      user: { id: user._id, role: user.role, fullName: user.fullName, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1y',
    });

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch User Profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Recruiter') {
      const postedJobs = await Job.find({ recruiterId: user._id })
        .populate('applications')
        .sort({ createdAt: -1 });

      const profileData = {
        ...user.toObject(),
        postedJobs: postedJobs.map((job) => ({
          ...job.toObject(),
          applicationCount: job.applications?.length || 0,
        })),
        jobsCount: postedJobs.length,
        companyStats: {
          activeJobs: postedJobs.filter((job) => job.status === 'Active').length,
          totalApplications: await Application.countDocuments({ recruiterId: user._id }),
        },
      };
      return res.json({ user: profileData });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile (Resume for Job Seeker, Company for Recruiter)
router.put('/profile', protect, upload.none(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Recruiter') {
      const companyData = typeof req.body.company === 'string' ? JSON.parse(req.body.company) : req.body.company;

      if (!companyData?.name?.trim()) {
        return res.status(400).json({ message: 'Company name is required' });
      }
      if (!companyData?.description?.trim()) {
        return res.status(400).json({ message: 'Company description is required' });
      }

      if (!user.company) {
        user.company = {};
      }

      user.company.name = companyData.name.trim();
      user.company.description = companyData.description.trim();
      user.company.location = companyData.location?.trim() || user.company.location || '';
      user.company.website = companyData.website?.trim() || user.company.website || '';
      user.company.industry = companyData.industry?.trim() || user.company.industry || '';
      user.company.size = companyData.size?.trim() || user.company.size || '';
      user.company.employees = companyData.employees !== undefined ? companyData.employees : user.company.employees || 0;
      user.company.logo = user.company.logo || '/uploads/profiles/default-company.jpg';
      user.company.status = user.company.status || 'Active';

      await user.save();
      return res.json({ message: 'Company profile updated successfully', user });
    }

    if (user.role === 'Job Seeker') {
      const { fullName, email, phoneNumber, resume } = req.body;

      if (!fullName?.trim()) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      if (!email?.trim()) {
        return res.status(400).json({ message: 'Email is required' });
      }
      if (!phoneNumber?.trim()) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      user.fullName = fullName.trim();
      user.email = email.trim();
      user.phoneNumber = phoneNumber.trim();

      if (resume) {
        user.resume = {
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          education: resume.education?.filter((edu) => edu.degree && edu.institution) || [],
          experience: (resume.experience || []).map((exp) => ({
            jobTitle: exp.jobTitle?.trim(),
            company: exp.company?.trim(),
            duration: exp.duration?.trim(),
          })),
          skills: resume.skills?.filter((skill) => skill.trim()) || [],
        };
      }

      await user.save();
      return res.json({ message: 'Profile updated successfully', user });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', details: error.message });
  }
});

// Update Profile Picture (for Job Seekers) or Company Logo (for Recruiters)
router.put('/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;
    if (user.role === 'Job Seeker') {
      user.profilePicture = filePath;
    } else if (user.role === 'Recruiter') {
      if (!user.company) {
        user.company = { logo: filePath };
      } else {
        user.company.logo = filePath;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated',
      profilePicture: filePath,
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// New Route: Update Company Logo (specific for Recruiters)
router.put('/company-logo', protect, upload.single('companyLogo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Only recruiters can update company logo' });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;
    if (!user.company) {
      user.company = { logo: filePath };
    } else {
      user.company.logo = filePath;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Company logo updated',
      companyLogo: filePath,
    });
  } catch (error) {
    console.error('Error uploading company logo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Other Routes (unchanged)
router.get('/recruiters/job-seekers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Access denied. Recruiter only.' });
    }

    const jobSeekers = await User.find({ role: 'Job Seeker' })
      .select('-password')
      .select('fullName email phoneNumber resume profilePicture');

    res.json(jobSeekers);
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', forgotPassword);

router.post('/recruiters/job-seekers/:id/status', protect, async (req, res) => {
  try {
    const recruiter = await User.findById(req.user.id);
    if (!recruiter || recruiter.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Access denied. Recruiter only.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const jobSeeker = await User.findById(id);
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }

    jobSeeker.status = status;
    await jobSeeker.save();

    res.json({ message: 'Status updated successfully', jobSeeker });
  } catch (error) {
    console.error('Error updating job seeker status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/saved-jobs', protect, async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $addToSet: { savedJobs: jobId } },
      { new: true, runValidators: true }
    ).populate('savedJobs');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      savedJobs: updatedUser.savedJobs,
    });
  } catch (error) {
    console.error('Save job error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid job ID format' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message,
    });
  }
});

router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      select: 'title company location jobType salary experience createdAt',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: error.message,
    });
  }
});

router.delete('/saved-jobs/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const jobId = req.params.jobId;

    if (!user.savedJobs.includes(jobId)) {
      return res.status(404).json({ success: false, message: 'Job not found in saved jobs' });
    }

    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs',
    });
  } catch (error) {
    console.error('Delete saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing job from saved jobs',
    });
  }
});

router.get('/applications', protect, async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'Job Seeker') {
      applications = await Application.findByJobSeeker(req.user.id);
    } else if (req.user.role === 'Recruiter') {
      applications = await Application.findByRecruiter(req.user.id);
    } else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/applications/:applicationId/status', protect, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Not Hired', 'Processing'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: applicationId,
        recruiterId: req.user.id,
      },
      { status },
      { new: true }
    )
      .populate('jobId')
      .populate('jobSeekerId', 'fullName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Status updated successfully', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
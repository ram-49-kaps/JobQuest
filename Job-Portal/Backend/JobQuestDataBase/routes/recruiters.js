import express from 'express';
import User from '../models/Users.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import jwt from 'jsonwebtoken';  // Add this import

const router = express.Router();

// Middleware to protect routes (copied from auth.js for completeness)
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Decoded token in recruiters route:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get job seekers who applied to recruiter's jobs (only accessible to Recruiters)
router.get('/job-seekers', protect, async (req, res) => {
  console.log('User accessing job-seekers:', req.user);
  if (req.user.role !== 'Recruiter') {
    return res.status(403).json({ message: 'Access denied: Recruiter role required' });
  }
  try {
    // Get all applications for this recruiter's jobs
    const applications = await Application.find({ recruiterId: req.user.id })
      .populate('jobSeekerId', '-password')
      .populate('jobId', 'title company');
    
    // Extract unique job seekers from applications and add their status
    const jobSeekersMap = new Map();
    
    applications.forEach(application => {
      if (application.jobSeekerId && !jobSeekersMap.has(application.jobSeekerId._id.toString())) {
        const jobSeeker = application.jobSeekerId.toObject();
        jobSeeker.status = application.status;
        jobSeeker.appliedJobs = [];
        jobSeekersMap.set(jobSeeker._id.toString(), jobSeeker);
      }
      
      // Add job information to the job seeker's applied jobs
      if (application.jobId) {
        const jobSeeker = jobSeekersMap.get(application.jobSeekerId._id.toString());
        jobSeeker.appliedJobs.push({
          jobId: application.jobId._id,
          title: application.jobId.title,
          status: application.status
        });
      }
    });

    const jobSeekers = Array.from(jobSeekersMap.values());
    res.json(jobSeekers);
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recruiter profile
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const recruiter = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    if (recruiter.role !== 'Recruiter') {
      return res.status(400).json({ message: 'User is not a recruiter' });
    }

    // Transform the company data to match frontend expectations
    const { company, ...recruiterData } = recruiter;
    res.json({
      ...company,
      id: recruiter._id,
      logo: recruiter.profilePicture || 'https://via.placeholder.com/150'
    });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.post('/job-seekers/:jobSeekerId/status', protect, async (req, res) => {
  if (req.user.role !== 'Recruiter') {
    return res.status(403).json({ message: 'Access denied: Recruiter role required' });
  }
  
  try {
    const { jobSeekerId } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Not Hired', 'Processing'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findOneAndUpdate(
      { 
        jobSeekerId: jobSeekerId,
        recruiterId: req.user.id
      },
      { 
        status,
        updatedAt: Date.now(),
        notificationSent: false
      },
      { new: true }
    )
    .populate('jobSeekerId', 'fullName email')
    .populate('jobId', 'title company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get job details for the response
    const jobDetails = await Job.findById(application.jobId);

    res.json({
      message: `Application status updated to ${status}`,
      application: {
        ...application.toObject(),
        job: jobDetails
      }
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company profile by ID
router.get('/profile/:id', protect, async (req, res) => {
  try {
    // Validate if id is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid profile ID format' });
    }

    const recruiter = await User.findById(req.params.id)
      .select('-password')
      .populate('company')
      .lean();
    
    if (!recruiter || recruiter.role !== 'Recruiter') {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Get all jobs posted by this recruiter
    const postedJobs = await Job.find({ recruiterId: req.params.id })
      .sort({ createdAt: -1 });

    // Combine all data
    const profileData = {
      ...recruiter,
      postedJobs,
      jobsCount: postedJobs.length,
      companyStats: {
        activeJobs: postedJobs.filter(job => job.status === 'Active').length,
        totalApplications: await Application.countDocuments({ recruiterId: req.params.id })
      }
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top companies
router.get('/top-companies', async (req, res) => {
  try {
    const companies = await User.aggregate([
      { $match: { role: 'Recruiter', 'company.name': { $ne: null } } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'recruiterId',
          as: 'jobs'
        }
      },
      {
        $project: {
          _id: 1,
          name: '$company.name',
          description: '$company.description',
          logo: {
            $ifNull: ['$company.logo', '/uploads/profiles/default-company.jpg']
          },
          industry: '$company.industry',
          jobCount: { $size: '$jobs' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      companies: companies.map(company => ({
        id: company._id,
        name: company.name,
        logo: company.logo,
        description: company.description,
        industry: company.industry,
        jobCount: company.jobCount
      }))
    });
  } catch (error) {
    console.error('Error fetching top companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top companies',
      error: error.message
    });
  }
});

// Get recruiter profile with complete company details
router.get('/profile', protect, async (req, res) => {
  try {
    // Find recruiter with company details
    const recruiter = await User.findById(req.user.id)
      .select('-password')
      .lean();
    
    if (!recruiter || recruiter.role !== 'Recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Get all jobs posted by this recruiter
    const postedJobs = await Job.find({ recruiterId: req.user.id })
      .sort({ createdAt: -1 });

    // Combine all data
    const profileData = {
      ...recruiter,
      postedJobs,
      jobsCount: postedJobs.length,
      companyStats: {
        activeJobs: postedJobs.filter(job => job.status === 'Active').length,
        totalApplications: await Application.countDocuments({ recruiterId: req.user.id })
      }
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all recruiters
router.get('/', protect, async (req, res) => {
  try {
    const recruiters = await User.find({ role: 'Recruiter' })
      .select('-password')
      .select('company')
      .lean();
    
    res.json(recruiters);
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
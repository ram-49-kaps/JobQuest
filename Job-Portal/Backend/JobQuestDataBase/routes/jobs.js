import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// Helper function to parse salary string (unchanged)
const parseSalary = (salaryString) => {
  if (!salaryString || typeof salaryString !== 'string') return null;

  const cleaned = salaryString.replace(/[$,]/g, '').trim();

  if (!cleaned || cleaned.toLowerCase() === 'not specified') return null;

  const range = cleaned.split(' - ');

  if (range.length === 2) {
    const min = parseFloat(range[0]);
    const max = parseFloat(range[1]);
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max, average: (min + max) / 2 };
    }
  } else {
    const value = parseFloat(cleaned);
    if (!isNaN(value)) {
      return { min: value, max: value, average: value };
    }
  }

  return null;
};

// New endpoint to fetch filter options (unchanged)
router.get('/filters', async (req, res) => {
  try {
    const jobTypes = await Job.distinct('jobType');
    const experienceLevels = await Job.distinct('experience');
    const skills = await Job.distinct('skills');

    const capitalize = (str) => {
      if (!str) return str;
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
    };

    const formattedJobTypes = jobTypes.map(capitalize);
    const formattedExperienceLevels = experienceLevels.map(level => {
      const shortForm = {
        'Entry Level': 'Entry',
        'Mid Level': 'Mid',
        'Senior Level': 'Senior',
        'Executive': 'Executive'
      };
      return shortForm[level] || level;
    });

    res.json({
      jobTypes: formattedJobTypes,
      experienceLevels: formattedExperienceLevels,
      skills
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs with pagination and filters (unchanged)
// Update the main GET route to handle recruiter jobs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterQuery = {};
    
    if (req.query.recruiterId) {
      filterQuery.recruiterId = req.query.recruiterId;
      console.log('Filtering for recruiter:', req.query.recruiterId);
    }

    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      filterQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { company: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (req.query.jobType && req.query.jobType.trim()) {
      filterQuery.jobType = { $regex: new RegExp(`^${req.query.jobType}$`, 'i') };
      console.log('Filtering by jobType:', req.query.jobType);
    }
    
    if (req.query.experience && ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].includes(req.query.experience)) {
      filterQuery.experience = req.query.experience;
    }
    
    if (req.query.location && req.query.location.trim()) {
      filterQuery.location = { $regex: req.query.location.trim(), $options: 'i' };
    }
    
    if (req.query.industry && req.query.industry.trim()) {
      filterQuery.industry = { $regex: req.query.industry.trim(), $options: 'i' };
    }

    if (req.query.status) {
      filterQuery.status = req.query.status;
    } else {
      filterQuery.status = 'Active';
    }

    let sortQuery = { createdAt: -1 };
    if (req.query.sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    }

    let jobs = await Job.find(filterQuery)
      .populate({
        path: 'recruiterId',
        select: 'fullName profilePicture company',
      })
      .populate('applications')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    if (req.query.minSalary || req.query.maxSalary) {
      const minSalary = req.query.minSalary ? parseFloat(req.query.minSalary) : 0;
      const maxSalary = req.query.maxSalary ? parseFloat(req.query.maxSalary) : Infinity;

      jobs = jobs.filter(job => {
        const salary = parseSalary(job.salary);
        if (!salary) return !req.query.minSalary;

        if (minSalary === maxSalary) {
          return salary.min === salary.max && salary.min === minSalary;
        } else {
          const meetsMin = minSalary > 0 ? salary.max >= minSalary : true;
          const meetsMax = maxSalary < Infinity ? salary.min <= maxSalary : true;
          return meetsMin && meetsMax;
        }
      });
    }

    if (req.query.sort === 'salary-high-to-low' || req.query.sort === 'salary-low-to-high') {
      jobs.sort((a, b) => {
        const salaryA = parseSalary(a.salary)?.average || 0;
        const salaryB = parseSalary(b.salary)?.average || 0;
        return req.query.sort === 'salary-high-to-low' ? salaryB - salaryA : salaryA - salaryB;
      });
    }

    jobs = jobs.map(job => ({
      ...job.toObject(),
      logo: job.recruiterId?.company?.logo || job.logo || '/uploads/profiles/default-company.jpg',
      recruiterProfilePicture: job.recruiterId?.profilePicture || '/uploads/profiles/default-profile.jpg',
      recruiterName: job.recruiterId?.fullName || 'Unknown Recruiter',
      applicationCount: job.applications ? job.applications.length : 0,
    }));

    const total = await Job.countDocuments(filterQuery);

    res.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + jobs.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove the /recruiter-jobs route as it's no longer needed
// Other routes (unchanged)
router.get('/top-companies', async (req, res) => {
  try {
    const companies = await Job.aggregate([
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 },
          logo: { $first: '$logo' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move /recruiter-jobs before /:id
router.get('/recruiter-jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('applications')
      .populate({
        path: 'recruiterId',
        select: 'company',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      });

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'recruiterId',
        select: '_id fullName email company',
        populate: {
          path: 'company',
          select: 'name logo description'
        }
      });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the post route (unchanged)
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      industry, 
      jobType, 
      salary, 
      location, 
      description, 
      experience, 
      applicationDeadline, 
      companyId, 
      companyName,
      recruiterId,
      requirements,
      responsibilities,
      skills
    } = req.body;

    // Validate required fields
    if (!title || !industry || !jobType || !salary || !location || !description || !recruiterId || !companyName || !requirements || !responsibilities) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, industry, jobType, salary, location, description, recruiterId, company name, requirements, and responsibilities'
      });
    }

    const jobData = {
      title,
      company: companyName,
      industry,
      jobType,
      salary,
      location,
      description,
      experience: experience || 'Entry Level',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      recruiterId,
      logo: req.body.logo || '',
      requirements: Array.isArray(requirements) ? requirements : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      skills: Array.isArray(skills) ? skills : []
    };

    // Validate date format
    if (applicationDeadline && isNaN(new Date(applicationDeadline).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application deadline date format'
      });
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error posting job'
    });
  }
});

export default router;
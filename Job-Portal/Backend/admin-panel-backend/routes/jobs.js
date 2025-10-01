import express from 'express';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { 
      search,
      location,
      type,
      experience,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (experience) query.experience = experience;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with filters, sorting, and pagination
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in GET /jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    // Ensure the user has a company associated
    if (!req.user.company) {
      return res.status(400).json({ message: 'No company associated with this user' });
    }

    // Validate required fields
    const { title, location, type, experience } = req.body;
    if (!title || !location || !type || !experience) {
      return res.status(400).json({ 
        message: 'Missing required fields. Please provide title, location, type, and experience.' 
      });
    }

    const jobData = {
      ...req.body,
      company: req.user.company.name,
      companyId: req.user.company._id
    };

    const job = new Job(jobData);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    // Send back the specific validation error message
    res.status(400).json({ message: error.message || 'Error creating job' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting job' });
  }
});

export default router;
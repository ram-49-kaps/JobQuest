import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const router = express.Router();

// Apply for a job
router.post('/apply/:jobId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Job Seeker') {
      return res.status(403).json({ message: 'Only job seekers can apply for jobs' });
    }

    const jobId = req.params.jobId;
    const job = await Job.findById(jobId).populate('recruiterId');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({
      jobSeekerId: req.user.id,
      jobId: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      jobSeekerId: req.user.id,
      recruiterId: job.recruiterId,
      jobId: jobId,
      coverLetter: req.body.coverLetter || '', // Optional
      // Resume fields removed
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: application,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
});

// Rest of the routes remain unchanged
router.get('/my-applications', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Job Seeker') {
      return res.status(403).json({ message: 'Access denied: Job Seeker role required' });
    }

    const applications = await Application.find({ jobSeekerId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location salary jobType description',
      })
      .populate({
        path: 'recruiterId',
        select: 'fullName email company',
        populate: { path: 'company', select: 'name logo' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.get('/recruiter-applications', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Access denied: Recruiter role required' });
    }

    const recruiterJobs = await Job.find({ recruiterId: req.user.id });
    const jobIds = recruiterJobs.map(job => job._id);

    const applications = await Application.find({
      jobId: { $in: jobIds },
      recruiterId: req.user.id,
    })
      .populate('jobSeekerId', 'fullName email resume')
      .populate('jobId', 'title company location salary jobType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.patch('/status/:applicationId', protect, async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!req.body || !req.body.status) {
      return res.status(400).json({ message: 'Status is required in request body' });
    }

    const { status } = req.body;
    const validStatuses = Application.schema.path('status').enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (req.user.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Only recruiters can update application status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    console.error('Detailed error updating application status:', {
      message: error.message,
      stack: error.stack,
      applicationId: req.params.applicationId,
      status: req.body?.status,
      user: req.user,
    });
    res.status(500).json({
      message: 'Error updating application status',
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
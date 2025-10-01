import express from 'express';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import Company from '../models/Company.js';
import auth from '../middleware/auth.js'; // Assuming you want to protect these routes

const router = express.Router();

// GET Dashboard Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeCandidates = await Candidate.countDocuments({ status: 'Reviewing' });
    const totalApplications = await Candidate.countDocuments();
    const hiredCandidates = await Candidate.countDocuments({ status: 'Approved' });

    const stats = [
      {
        title: 'Total Jobs',
        value: totalJobs.toString(),
        change: calculateChange(totalJobs), // Simplified; replace with real logic if needed
        color: 'bg-admin-primary/10 text-admin-primary',
      },
      {
        title: 'Active Candidates',
        value: activeCandidates.toString(),
        change: calculateChange(activeCandidates),
        color: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Total Applications',
        value: totalApplications.toString(),
        change: calculateChange(totalApplications),
        color: 'bg-green-100 text-green-600',
      },
      {
        title: 'Hired Candidates',
        value: hiredCandidates.toString(),
        change: calculateChange(hiredCandidates),
        color: 'bg-purple-100 text-purple-600',
      },
    ];

    res.json(stats);
  } catch (error) {
    console.error('GET /dashboard/stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET Recent Jobs
router.get('/recent-jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(3); // Limit to 3 recent jobs

    const recentJobs = jobs.map(job => ({
      title: job.title,
      applicants: Math.floor(Math.random() * 20) + 1, // Mock applicants; replace with real data if available
      status: job.status,
      date: formatDate(job.createdAt), // Format date relative to current date
    }));

    res.json(recentJobs);
  } catch (error) {
    console.error('GET /dashboard/recent-jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate percentage change (mock implementation)
function calculateChange(current) {
  const previous = current * 0.9; // Mock previous value (10% less)
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
}

// Helper function to format date relative to today (March 17, 2025)
function formatDate(date) {
  const today = new Date('2025-03-17'); // Current date as per your context
  const jobDate = new Date(date);
  const diffTime = today - jobDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export default router;
import express from 'express';
import Job from '../models/Job.js';
import User from '../models/Users.js';
import mongoose from 'mongoose';

const router = express.Router();

// In-memory cache with 5-minute expiration
let statsCache = {
  data: null,
  lastUpdated: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get homepage statistics
router.get('/', async (req, res) => {
  try {
    // Check cache first
    if (statsCache.data && statsCache.lastUpdated && 
        (Date.now() - statsCache.lastUpdated < CACHE_DURATION)) {
      return res.json(statsCache.data);
    }

    // Get total jobs count with proper status filter
    const totalJobs = await Job.countDocuments({ 
      status: 'Active',
      applicationDeadline: { $gt: new Date() }
    });

    // Get candidates statistics
    let candidatesStats = await User.aggregate([
      { $match: { role: 'Job Seeker' } },
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          experienceLevels: {
            $push: "$experience"
          },
          skills: {
            $push: "$skills"
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalCandidates: 1,
          experienceLevels: {
            $reduce: {
              input: "$experienceLevels",
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  { $literal: { "$$this": { $add: [{ $ifNull: [{ $getField: { field: "$$this", input: "$$value" } }, 0] }, 1] } } }
                ]
              }
            }
          },
          skills: {
            $reduce: {
              input: { $reduce: { input: "$skills", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  { $literal: { "$$this": { $add: [{ $ifNull: [{ $getField: { field: "$$this", input: "$$value" } }, 0] }, 1] } } }
                ]
              }
            }
          }
        }
      }
    ]).exec();

    // Ensure candidatesStats has a default value if no results
    if (!candidatesStats.length) {
      candidatesStats = [{
        totalCandidates: 0,
        experienceLevels: {},
        skills: {}
      }];
    }

    // Get companies statistics
    let companiesStats = await User.aggregate([
      {
        $match: {
          role: 'Recruiter',
          'company': { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalCompanies: { $sum: 1 },
          industries: {
            $addToSet: '$company.industry'
          },
          locations: {
            $addToSet: '$company.location'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalCompanies: 1,
          industries: 1,
          locations: 1
        }
      }
    ]).exec();

    // Get featured companies (companies with active jobs)
    const featuredCompanies = await User.aggregate([
      { 
        $match: { 
          role: 'Recruiter', 
          'company': { $ne: null },
          status: 'Active'
        } 
      },
      { 
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'recruiterId',
          as: 'jobs'
        }
      },
      { 
        $match: { 
          'jobs.status': 'Active',
          'jobs.applicationDeadline': { $gt: new Date() }
        } 
      },
      {
        $project: {
          'company.name': 1,
          'company.logo': 1,
          'company.industry': 1,
          'company.description': 1,
          activeJobsCount: { $size: '$jobs' }
        }
      },
      { $sort: { activeJobsCount: -1 } },
      { $limit: 5 }
    ]);

    // Get recent jobs (latest 3 active jobs)
    const recentJobs = await Job.find({ 
      status: 'Active',
      applicationDeadline: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Get categories for "Explore Your Path" section (industries with job counts)
    const industries = await Job.aggregate([
      { 
        $match: { 
          status: 'Active',
          applicationDeadline: { $gt: new Date() }
        } 
      },
      { 
        $group: { 
          _id: '$industry', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const categoryIcons = {
      'Technology': '💻',
      'Finance': '💰',
      'Healthcare': '🏥',
      'Education': '📚',
      'Marketing': '📣',
      // Add more as needed
    };

    const categories = industries.map(industry => ({
      name: industry._id,
      icon: categoryIcons[industry._id] || '📦', // Default icon if not found
      count: industry.count
    }));

    // Ensure companiesStats has a default value if no results
    if (!companiesStats.length) {
      companiesStats = [{
        totalCompanies: 0,
        industries: [],
        locations: []
      }];
    }

    const responseData = {
      stats: {
        totalJobs,
        candidates: candidatesStats[0] || { totalCandidates: 0, experienceLevels: {}, skills: {} },
        companies: companiesStats[0] || { totalCompanies: 0, industries: [], locations: [] },
      },
      featuredCompanies,
      recentJobs,
      categories
    };

    // Update cache
    statsCache.data = responseData;
    statsCache.lastUpdated = Date.now();

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching homepage statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
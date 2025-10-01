import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';
import JobListing from './JobListing';
import { Trash2 } from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/auth/saved-jobs');
      setSavedJobs(response.data.savedJobs);
    } catch (error) {
      toast.error('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      const response = await api.delete(`/auth/saved-jobs/${jobId}`);
      
      if (response.data.success) {
        toast.success('Job removed successfully');
        // Refresh the jobs list
        fetchSavedJobs();
      } else {
        toast.error(response.data.message || 'Failed to remove job');
      }
    } catch (error) {
      console.error('Delete job error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove job');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 mt-16">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Saved Jobs</h1>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-[#249885] text-white px-4 py-2 rounded-md hover:bg-[#155a4e] transition-colors"
            >
              Browse More Jobs
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved jobs yet</h3>
              <p className="text-gray-500 mb-6">Start saving jobs you're interested in!</p>
              <button
                onClick={() => navigate('/jobs')}
                className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                Find Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div key={job._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                      <p className="text-gray-600">{job.company}</p>
                      <div className="mt-2 space-x-2">
                        <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                          {job.jobType}
                        </span>
                        <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedJobs;
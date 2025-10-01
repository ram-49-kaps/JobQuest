import React, { useState } from 'react';
import { Briefcase, Clock, DollarSign, MapPin, Bookmark, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '../redux/AllJobs/hooks';
import { filterJobs } from '../utils/filterJobs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import api from '../api';
import moment from 'moment';

const JobListing = ({ jobs, isLoading }) => {
  const navigate = useNavigate();
  const filters = useAppSelector(state => state.filter);
  const [sortBy, setSortBy] = useState('latest');
  const [bookmarkLoading, setBookmarkLoading] = useState({});



  const filteredJobs = filterJobs(jobs, filters);
  
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'salary':
        const getSalaryValue = (salary) => {
          if (!salary) return 0;
          const parts = salary.split('-');
          const maxPart = parts.length > 1 ? parts[1] : parts[0];
          return parseInt(maxPart.replace(/\D/g, '')) || 0;
        };
        return getSalaryValue(b.salary) - getSalaryValue(a.salary);
      default:
        return 0;
    }
  });
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleBookmark = async (jobId) => {
    setBookmarkLoading(prev => ({ ...prev, [jobId]: true }));
    
    try {
      const response = await api.post('/auth/saved-jobs', { jobId });
      
      if (response.data.success) {
        toast.success('Job saved successfully!');
        navigate('/saved-jobs'); // Add this line to redirect
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleJobDetailsClick = (jobId) => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    } else {
      toast.error('Invalid job ID');
    }
  };

  // Update the Button onClick handler
  <Button 
    onClick={() => handleJobDetailsClick(job._id)}
    className="px-6 py-2.5 bg-[#249885] hover:bg-[#155a4e] text-white rounded-md transition-colors font-medium"
  >
    View Details
  </Button>

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(6)].map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-600 font-medium">
          Showing {sortedJobs.length} of {jobs.length} results
        </h2>
        <div className="relative">
          <select 
            className="appearance-none border rounded-md px-4 py-2 pr-8 bg-white"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="latest">Sort by latest</option>
            <option value="oldest">Sort by oldest</option>
            <option value="title">Sort by title</option>
            <option value="salary">Sort by salary</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {sortedJobs.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold text-gray-600">No jobs found matching your criteria</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedJobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <span className="inline-block text-xs text-[#75b5aa] bg-[#eaf6f4] px-2 py-1 rounded mb-1">
                    {moment(job.createdAt).fromNow()}
                  </span>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  
                  {/* Job details section */}
                  <div className="mt-4 flex flex-wrap gap-4">
        
                    <div className="flex flex-wrap gap-2 mt-3">
                      <div className="inline-flex items-center text-sm bg-[#eaf6f4] px-3 py-1 rounded-md mr-2">
                        <Briefcase className="mr-1 h-4 w-4" />
                        <span>{job.industry}</span>
                      </div>
                      <div className="inline-flex items-center text-sm bg-[#eaf6f4] px-3 py-1 rounded-md mr-2">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{job.jobType}</span>
                      </div>
                      <div className="inline-flex items-center text-sm bg-[#eaf6f4] px-3 py-1 rounded-md mr-2">
                        <DollarSign className="mr-1 h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="inline-flex items-center text-sm bg-[#eaf6f4] px-3 py-1 rounded-md mr-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions section */}
              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <button 
                  onClick={() => handleBookmark(job._id)}
                  disabled={bookmarkLoading[job._id]}
                  className={`relative p-2 rounded-full hover:bg-[#eaf6f4] transition-colors ${
                    bookmarkLoading[job._id] ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:text-[#249885]'
                  }`}
                >
                  {bookmarkLoading[job._id] ? (
                    <div className="animate-spin h-5 w-5 border-2 border-[#249885] border-t-transparent rounded-full" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
                <Button 
                  onClick={() => handleJobDetailsClick(job._id)}
                  className="px-6 py-2.5 bg-[#249885] hover:bg-[#155a4e] text-white rounded-md transition-colors font-medium"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {sortedJobs.length > 0 && (
        <div className="flex justify-center mt-10 space-x-2">
       
        </div>
      )}
    </div>
  );
};

export default JobListing;
import React, { useState, useEffect } from 'react';
  import { useSelector } from 'react-redux';
  import { useNavigate } from 'react-router-dom';
  import JobSearchFilter from '../components/JobsSearchFilter';
  import JobListing from '../components/JobListing';
  import TopCompanies from '../components/TopCompanies';
  import Footer from './Shared/Footer';
  import Navbar from './Shared/Navbar';
  import api from '../api';
  import moment from 'moment';
  import { motion } from 'framer-motion';


  const Jobs = () => {
    const { token, loading: authLoading, fullName, role, user } = useSelector((store) => store.auth);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [filters, setFilters] = useState({
      jobType: '',
      experience: '',
      location: '',
      industry: '',
      search: '',
      minSalary: '',
      maxSalary: ''
    });
    const [sortBy, setSortBy] = useState('newest');
    const [pagination, setPagination] = useState({
      page: 1,
      pages: 1,
      total: 0,
      hasMore: false
    });
    const [pageSize] = useState(10);

    useEffect(() => {
      const fetchData = async () => {
        try {
          if (!token) {
            navigate('/login');
            return;
          }

          if (role === 'Recruiter') {
            navigate('/recruiter-dashboard');
            return;
          }

          setLoading(true);
          setError(null);

          const params = {
            ...filters,
            sort: sortBy,
            page: pagination.page,
            limit: pageSize
          };
          console.log('Sending API request with params:', params); // Debug log
          const [jobsResponse, companiesResponse] = await Promise.all([
            api.get('/jobs', { params }),
            api.get('/jobs/top-companies')
          ]);

          console.log('Jobs response data:', jobsResponse.data); // Debug log
          if (jobsResponse.data && jobsResponse.data.jobs) {
            const formattedJobs = jobsResponse.data.jobs.map((job) => ({
              ...job,
              timeAgo: moment(job.createdAt).fromNow(),
              salary: job.salary || 'Not specified',
              applicationDeadline: job.applicationDeadline 
                ? moment(job.applicationDeadline).format('MMM DD, YYYY')
                : 'Open until filled',
              companyLogo: job.recruiterId?.company?.logo || '/company-placeholder.png'
            }));
            setJobs(formattedJobs);
            setPagination({
              page: parseInt(jobsResponse.data.pagination.page),
              pages: parseInt(jobsResponse.data.pagination.pages),
              total: parseInt(jobsResponse.data.pagination.total),
              hasMore: jobsResponse.data.pagination.page < jobsResponse.data.pagination.pages
            });
          } else {
            setJobs([]);
            setPagination({ page: 1, pages: 1, total: 0, hasMore: false });
          }

          if (companiesResponse.data && Array.isArray(companiesResponse.data)) {
            setCompanies(companiesResponse.data);
          }

          const justLoggedIn = localStorage.getItem('justLoggedIn');
          if (justLoggedIn === 'true') {
            setShowWelcomePopup(true);
            localStorage.removeItem('justLoggedIn');
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError(err.response?.data?.message || 'Failed to load jobs and companies');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [token, role, navigate, user, filters, sortBy, pagination.page]);

    const handleFilterChange = (newFilters) => {
      console.log('Received new filters in Jobs.jsx:', newFilters); // Debug log
      setFilters(prev => ({
        ...prev,
        ...newFilters
      }));
      setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSortChange = (value) => {
      setSortBy(value);
      setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Enhanced loading state
    if (authLoading || loading) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filter Skeleton */}
              <div className="lg:w-1/4">
                <div className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-md mb-6"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3 mb-6">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs List Skeleton */}
              <div className="lg:w-3/4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-lg w-full"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
              </div>
              <p className="mt-3 text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setPagination(prev => ({ ...prev, page: 1 }));
                  setFilters({
                    jobType: '',
                    experience: '',
                    location: '',
                    industry: '',
                    search: '',
                    minSalary: '',
                    maxSalary: ''
                  });
                  setSortBy('newest');
                }}
                className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry</span>
              </button>
            </motion.div>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mt-12 relative">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <JobSearchFilter 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSortChange={handleSortChange}
                  sortBy={sortBy}
                />
              </div>
              <div className="lg:w-3/4">
                {jobs.length > 0 ? (
                  <JobListing 
                    jobs={jobs}
                    onApply={(jobId) => navigate(`/jobs/${jobId}/apply`)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 bg-white rounded-lg shadow-md"
                  >
                    <p className="text-xl text-gray-600">No jobs match your criteria.</p>
                    <button
                      onClick={() => {
                        setFilters({
                          jobType: '',
                          experience: '',
                          location: '',
                          industry: '',
                          search: '',
                          minSalary: '',
                          maxSalary: ''
                        });
                        setSortBy('newest');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
                {jobs.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pageSize) + 1} to {Math.min(pagination.page * pageSize, pagination.total)} of {pagination.total} jobs
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.pages}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <TopCompanies companies={companies} />
        </main>
        <Footer />

        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-teal-600">Welcome back, {fullName || 'User'}!</h2>
                <p className="text-gray-600">We're glad to see you again. Explore the latest job opportunities!</p>
                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                  Let's Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  export default Jobs;
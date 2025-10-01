import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, DollarSign, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from './Shared/Footer';
import Navbar from './Shared/Navbar';
import api from '../api';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Building2 } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, role } = useSelector((store) => store.auth);

  const handleCompanyClick = () => {
    if (job && job.recruiterId && typeof job.recruiterId._id === 'string') {
      navigate(`/company-profile/${job.recruiterId._id}`);
    } else {
      console.log('Invalid recruiter ID:', job?.recruiterId);
      toast.error('Company profile not available');
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        toast.error('Invalid job ID');
        navigate('/jobs');
        return;
      }

      try {
        const response = await api.get(`/jobs/${id}`);
        if (response.data) {
          setJob(response.data);
        } else {
          toast.error('Job not found');
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to fetch job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!token) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }
    if (role !== 'Job Seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    try {
      const response = await api.post(`/applications/apply/${id}`);
      if (response.data.success) {
        toast.success('Successfully applied for the job!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for the job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#249885]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <p className="mt-4 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="mt-8">
          <Button>
            <ArrowLeft className="mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  // Normalize requirements and responsibilities to always be arrays
  const requirements = Array.isArray(job.requirements) ? job.requirements : job.requirements ? [job.requirements] : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : job.responsibilities ? [job.responsibilities] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              {job.logo ? (
                <img
                  src={`http://localhost:5002${job.logo}`}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/uploads/profiles/default-company.jpg';
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <span className="inline-block text-xs text-[#75b5aa] bg-[#eaf6f4] px-2 py-1 rounded mb-1">
                    {moment(job.createdAt).fromNow()}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                  <p className="text-gray-600 text-lg">{job.company}</p>
                </div>
                <div className="flex space-x-3">
                  <Button className="bg-[#2a9281]" onClick={handleApply}>
                    Apply Now
                  </Button>
                  <Button variant="outline" className="border-[#afd3cd] text-[#42857a]">
                    Save Job
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <Briefcase className="h-5 w-5 text-[#afd3cd]" />
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{job.industry}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-[#afd3cd]" />
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium">{job.jobType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <DollarSign className="h-5 w-5 text-[#afd3cd]" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#afd3cd]" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <p className="text-gray-700 mb-6">{job.description}</p>

              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              {requirements.length > 0 ? (
                <ul className="list-disc list-inside mb-6 space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mb-6">No specific requirements listed.</p>
              )}

              <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
              {responsibilities.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {responsibilities.map((resp, index) => (
                    <li key={index} className="text-gray-700">{resp}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific responsibilities listed.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#afd3cd] p-2 mr-3">
                  {job.logo ? (
                    <img
                      src={`http://localhost:5002${job.logo}`}
                      alt={`${job.company} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = '/uploads/profiles/default-company.jpg';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{job.company}</h3>
                  <p className="text-gray-600 text-sm">{job.industry}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                A leading company in the {job.industry} industry with opportunities for professional growth and development.
              </p>
              <Button
                className="w-full bg-[#2a9281] hover:bg-[#257c6d]"
                onClick={handleCompanyClick}
              >
                View Company Profile
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Apply for this Job</h2>
              <p className="text-gray-700 mb-4">
                Ready to apply for this position? Click the button below to submit your application.
              </p>
              <Button
                className="w-full bg-[#2a9281] hover:bg-[#257c6d]"
                onClick={handleApply}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;
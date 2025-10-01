import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { setLoading } from '../redux/authSlice';
import api from '../api';

const PostJob = () => {
  const { token, role, user, loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [job, setJob] = useState({
    title: '',
    industry: '',
    jobType: '',
    salary: '',
    location: '',
    description: '',
    experience: '',
    applicationDeadline: '',
    companyId: user?.company?._id || '',
    companyName: user?.company?.name || '',
    requirements: '', // New field as string (will be split into array)
    responsibilities: '', // New field as string (will be split into array)
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!user?.company) {
      navigate('/company-setup');
      return;
    }
  }, [token, role, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status.isValid) {
      setStatus((prev) => ({ ...prev, error: 'Please fill in all required fields' }));
      return;
    }

    try {
      dispatch(setLoading(true));
      setStatus((prev) => ({ ...prev, error: null }));

      const jobData = {
        title: job.title,
        industry: job.industry,
        jobType: job.jobType,
        salary: job.salary,
        location: job.location,
        description: job.description,
        experience: job.experience || 'Entry Level',
        applicationDeadline: job.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recruiterId: user._id,
        companyId: user.company._id,
        companyName: user.company.name,
        logo: user.company.logo || job.logo,
        requirements: job.requirements.split('\n').filter(item => item.trim()), // Split by newline, filter empty
        responsibilities: job.responsibilities.split('\n').filter(item => item.trim()), // Split by newline, filter empty
      };

      const response = await api.post('/jobs', jobData);

      if (response.data) {
        setStatus((prev) => ({ ...prev, success: true }));
        setTimeout(() => {
          navigate('/recruiter-dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Job posting error:', error);
      setStatus((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to post job',
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const [status, setStatus] = useState({
    error: null,
    success: false,
    isValid: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const handleSelectChange = (name, value) => {
    setJob((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const validateForm = () => {
    const isValid =
      job.title.length > 2 &&
      job.industry.length > 0 &&
      job.jobType.length > 0 &&
      job.salary.length > 0 &&
      job.location.length > 0 &&
      job.requirements.length > 0 && // Require at least some requirements
      job.responsibilities.length > 0; // Require at least some responsibilities
    setStatus((prev) => ({ ...prev, isValid }));
  };

  if (role !== 'Recruiter') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access Denied: Recruiter role required</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (!user?.company) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please set up your company profile before posting a job.
            <Button asChild className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">
              <Link to="/company-setup">Set Up Company</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 mt-20"
    >
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Post a Job</CardTitle>
          <p className="text-gray-600">Create a new job listing to attract talent</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                name="title"
                placeholder="Job Title *"
                value={job.title}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <Input
                name="industry"
                placeholder="Industry *"
                value={job.industry}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <Select onValueChange={(value) => handleSelectChange('jobType', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Job Type *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                name="salary"
                placeholder="Salary (e.g., $40,000-$50,000) *"
                value={job.salary}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <Input
                name="location"
                placeholder="Location *"
                value={job.location}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <Select onValueChange={(value) => handleSelectChange('experience', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Experience Level *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <textarea
                name="description"
                placeholder="Job Description"
                value={job.description}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background transition-all duration-300 focus:ring-2 focus:ring-teal-500"
                rows={4}
              />
            </div>
            <div>
              <textarea
                name="requirements"
                placeholder="Requirements (one per line) *"
                value={job.requirements}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background transition-all duration-300 focus:ring-2 focus:ring-teal-500"
                rows={4}
              />
            </div>
            <div>
              <textarea
                name="responsibilities"
                placeholder="Responsibilities (one per line) *"
                value={job.responsibilities}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background transition-all duration-300 focus:ring-2 focus:ring-teal-500"
                rows={4}
              />
            </div>

            {status.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}

            {status.success && (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Job posted successfully! Redirecting...</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || !status.isValid}
              className="w-full bg-teal-600 hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post Job'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostJob;
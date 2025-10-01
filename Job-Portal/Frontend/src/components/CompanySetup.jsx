import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CompanySetup = () => {
  const { loading, role, user, token } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    industry: '',
    size: '',
  });

  const [status, setStatus] = useState({
    error: null,
    success: false,
    isValid: false,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (user?.company) {
      setCompany(user.company);
    }
    validateForm();
  }, [user]);

  useEffect(() => {
    if (role !== 'Recruiter') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (status.success) {
      const timer = setTimeout(() => {
        // Check if user is coming from profile edit
        const isProfileEdit = window.location.pathname.includes('edit');
        navigate(isProfileEdit ? '/recruiter-dashboard/profile' : '/recruiter-dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status.success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const validateForm = () => {
    const isValid = 
      company?.name?.trim()?.length > 0 && 
      company?.description?.trim()?.length > 0 &&
      company?.location?.trim()?.length > 0;
    setStatus(prev => ({ ...prev, isValid }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!status.isValid) {
      setStatus(prev => ({ ...prev, error: 'Please fill in all required fields' }));
      return;
    }

    try {
      dispatch(setLoading(true));
      setStatus(prev => ({ ...prev, error: null }));

      const response = await api.put('/auth/profile', { 
        company: {
          ...company,
          name: company.name.trim(),
          description: company.description.trim(),
          location: company.location.trim(),
          website: company.website.trim(),
          industry: company.industry.trim(),
          size: company.size.trim()
        }
      });

      if (response.data && response.data.user) { // Ensure we use response.data.user
        dispatch(setUser({
          token,
          role,
          user: response.data.user, // Use the full user object from backend
          fullName: response.data.user.fullName,
          logo: response.data.user.company?.logo || null, // Include logo if present
        }));

        setStatus(prev => ({ ...prev, success: true }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setStatus(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to update company profile'
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="max-w-3xl mx-auto shadow-xl border-none bg-white rounded-2xl">
        <CardHeader className="text-center pb-8 border-b">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Company Profile Setup
          </CardTitle>
          <p className="text-gray-600">Complete your company profile to start posting jobs and connecting with talent</p>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name *</label>
                <Input
                  name="name"
                  value={company.name}
                  onChange={handleChange}
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#249885] h-11"
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location *</label>
                <Input
                  name="location"
                  value={company.location}
                  onChange={handleChange}
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#249885] h-11"
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Description *</label>
              <textarea
                name="description"
                value={company.description}
                onChange={handleChange}
                className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249885] focus:border-transparent transition-all duration-300 resize-y"
                placeholder="Tell us about your company's mission, values, and culture..."
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Website</label>
                <Input
                  name="website"
                  value={company.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#249885] h-11"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Industry</label>
                <Input
                  name="industry"
                  value={company.industry}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Healthcare"
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#249885] h-11"
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Size</label>
              <select
                name="size"
                value={company.size}
                onChange={handleChange}
                className="w-full h-11 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249885] focus:border-transparent transition-all duration-300"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </motion.div>

            {status.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-red-50 p-4"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {status.success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-green-50 p-4"
              >
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Company profile saved successfully! Redirecting...</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="pt-4">
              <Button
                type="submit"
                disabled={loading || !status.isValid}
                className="w-full h-12 bg-[#249885] hover:bg-[#176759] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  'Save Company Profile'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanySetup;
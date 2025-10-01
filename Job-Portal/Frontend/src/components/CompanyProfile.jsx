import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';
import api from '../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CompanyProfile = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!id || typeof id !== 'string') {
        console.error('Invalid ID:', id);
        toast.error('Invalid company ID');
        return;
      }

      try {
        console.log('Fetching company profile with ID:', id);
        const response = await api.get(`/recruiters/profile/${id.toString()}`);
        if (response.data) {
          setCompany(response.data);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch company profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#249885]"></div>
        <p className="mt-4 text-gray-600">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Company Not Found</h1>
        <p className="mt-4 text-gray-600">The company you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="mt-8">
          <Button className="bg-[#249885] hover:bg-[#176759] text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 mt-16 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-[#249885] transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header Section with Logo */}
          <div className="relative bg-gradient-to-r from-[#249885] to-[#176759] p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <p className="text-lg opacity-90">{company.industry || 'Industry not specified'}</p>
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {company.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#249885]" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{company.location}</p>
                  </div>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#249885]" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#249885] hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#249885]" />
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="font-medium text-gray-800">{company.size}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About {company.name}</h2>
              <p className="text-gray-700 leading-relaxed">
                {company.description || 'No description available for this company.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyProfile;
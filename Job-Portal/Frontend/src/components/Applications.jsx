import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2, FileText } from 'lucide-react';
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';
import api from '../api';

const Applications = () => {
  const navigate = useNavigate();
  const { token, role } = useSelector((store) => store.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view applications');
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications');
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Not Hired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#249885]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>
        
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl text-gray-600 mb-4">No applications found</h2>
            <Button
              onClick={() => navigate('/jobs')}
              className="bg-[#2a9281] hover:bg-[#257c6d]"
            >
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#afd3cd] p-2 flex-shrink-0">
                          <img
                            src={application.jobId.logo}
                            alt={application.jobId.company}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {application.jobId.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{application.jobId.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                            {application.resume && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{application.resumeOriginalName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {application.statusMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Applications;
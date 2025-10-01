import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PlusCircle,
  Search,
  Briefcase,
  FileText
} from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';

const RecruiterDashboard = () => {
  const { token, role, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]); // Changed from jobSeekers to applications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResume, setSelectedResume] = useState(null);
  
  const itemsPerPage = 5;

  useEffect(() => {
    const localToken = localStorage.getItem('token');

    if (!token || !localToken) {
      navigate('/login');
      return;
    }

    if (token !== localToken) {
      setError('Authentication error: Please log in again');
      return;
    }

    if (role !== 'Recruiter') {
      navigate('/');
      return;
    }

    if (!user?.company) {
      navigate('/company-setup');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/recruiter-applications');
        if (!response.data || !response.data.success) {
          throw new Error('No data received from server');
        }
        setApplications(response.data.applications);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load applications';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, role, user, navigate]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await api.patch(`/applications/status/${applicationId}`, { status });
      
      if (response.data && response.data.success) {
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId ? { ...app, status, statusMessage: response.data.application.statusMessage } : app
          )
        );
        
        const statusMessages = {
          'Approved': 'Candidate has been approved for the position',
          'Not Hired': 'Candidate has been marked as not hired',
          'Processing': 'Application status set to processing'
        };
        
        setNotification({ 
          type: 'success', 
          message: statusMessages[status] || `Application ${status.toLowerCase()} successfully`
        });
      }
    } catch (err) {
      console.error('Status update error:', err);
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update status' 
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobSeekerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobSeekerId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    processing: applications.filter(a => a.status === 'Processing').length,
    rejected: applications.filter(a => a.status === 'Not Hired').length
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Briefcase className="h-12 w-12 text-teal-600" />
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 mt-20">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto p-6 pt-20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {user?.company?.name}</h1>
            <p className="text-gray-600">Manage your recruitment pipeline effectively</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-4">
                <Briefcase className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-gray-600">Total Applicants</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </div>
            </motion.div>
            {/* Other stat cards remain the same */}
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-gray-600">Approved</p>
                  <h3 className="text-2xl font-bold">{stats.approved}</h3>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-gray-600">Processing</p>
                  <h3 className="text-2xl font-bold">{stats.processing}</h3>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-4">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-gray-600">Not Hired</p>
                  <h3 className="text-2xl font-bold">{stats.rejected}</h3>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search applicants or jobs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded-md bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Not Hired">Not Hired</option>
            </select>
            <Button
              asChild
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2 flex items-center gap-2"
            >
              <Link to="/post-job">
                <PlusCircle className="h-5 w-5" />
                Post a Job
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            {currentApplications.length > 0 ? (
              currentApplications.map((application) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {application.jobSeekerId?.fullName || 'Unknown Applicant'}
                        </h3>
                        <p className="text-gray-600"><strong>Email:</strong> {application.jobSeekerId?.email || 'N/A'}</p>
                        <p className="text-gray-600"><strong>Job:</strong> {application.jobId?.title || 'Unknown Job'}</p>
                        <p className="text-sm text-gray-500">
                          Applied on: {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                        <Button
                          onClick={() => setSelectedResume(application.jobSeekerId?.resume)}
                          className="mt-3 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Full Resume
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {application.status === 'Approved' ? (
                          <Button className="bg-green-100 text-green-700 flex items-center gap-1" disabled>
                            <CheckCircle2 className="h-4 w-4" /> Approved
                          </Button>
                        ) : application.status === 'Not Hired' ? (
                          <Button className="bg-red-100 text-red-700 flex items-center gap-1" disabled>
                            <XCircle className="h-4 w-4" /> Not Hired
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleStatusUpdate(application._id, 'Approved')}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(application._id, 'Not Hired')}
                              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Not Hired
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(application._id, 'Processing')}
                              className={`${
                                application.status === 'Processing' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              } flex items-center gap-1`}
                            >
                              <Clock className="h-4 w-4" /> Processing
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume details */}
                  {application.jobSeekerId?.resume && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Education</h4>
                        {application.jobSeekerId.resume.education?.length > 0 ? (
                          <div className="space-y-2">
                            {application.jobSeekerId.resume.education.map((edu, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                <p className="text-sm text-gray-500">{edu.year || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No education details</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Experience</h4>
                        {application.jobSeekerId.resume.experience?.length > 0 ? (
                          <div className="space-y-2">
                            {application.jobSeekerId.resume.experience.map((exp, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{exp.jobTitle}</p>
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                <p className="text-sm text-gray-500">{exp.duration || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No experience details available</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Skills</h4>
                        {application.jobSeekerId.resume.skills?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {application.jobSeekerId.resume.skills.map((skill, index) => (
                              <span 
                                key={index} 
                                className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No skills listed</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-600 py-10"
              >
                No applications found matching your criteria.
              </motion.div>
            )}
          </div>

          {filteredApplications.length > 0 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="border-gray-200 hover:bg-gray-100"
              >
                Previous
              </Button>
              <span className="py-2 px-4 bg-white rounded-md border border-gray-200 shadow-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="border-gray-200 hover:bg-gray-100"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Resume Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Full Resume</h2>
              <Button 
                onClick={() => setSelectedResume(null)}
                variant="outline"
                className="rounded-full h-8 w-8 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            {/* Resume modal content remains the same */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Education</h3>
                {selectedResume.education?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedResume.education.map((edu, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-lg">{edu.degree}</h4>
                          <p className="text-gray-700">{edu.institution}</p>
                          <p className="text-gray-500">{edu.year || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No education details available</p>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Work Experience</h3>
                {selectedResume.experience?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedResume.experience.map((exp, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-lg">{exp.jobTitle}</h4>
                          <p className="text-gray-700">{exp.company}</p>
                          <p className="text-gray-500">{exp.duration || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No experience details available</p>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Skills</h3>
                {selectedResume.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No skills listed</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setSelectedResume(null)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default RecruiterDashboard;
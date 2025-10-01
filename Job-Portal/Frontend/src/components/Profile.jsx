import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setUser } from '../redux/authSlice';
import api from '../api';
import { User, GraduationCap, Briefcase, Code, Edit, Building, RefreshCw, Upload } from 'lucide-react';
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';

const Profile = () => {
  const { role, user, token, fullName, loading } = useSelector((store) => store.auth);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/profile');
        if (response.data && response.data.user) {
          const userData = response.data.user;
          dispatch(setUser({
            token,
            role: userData.role,
            user: userData,
            fullName: userData.fullName,
          }));
          setProfilePicture(role === 'Job Seeker' ? userData.profilePicture : userData.company?.logo || '');
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        setError('Failed to load profile');
      }
    };

    fetchUser();
  }, [token, dispatch, navigate]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (role === 'Job Seeker' && token) {
        try {
          const response = await api.get('/auth/applications');
          if (response.data && Array.isArray(response.data)) {
            setApplications(response.data);
          } else {
            setError('Failed to load applications: Invalid data format');
            setApplications([]);
          }
        } catch (error) {
          setError(error.response?.data?.message || 'Failed to load applications');
          setApplications([]);
        }
      }
    };

    fetchApplications();
  }, [token, role]);

  const [totalApplications, setTotalApplications] = useState(0);

  const fetchPostedJobs = async () => {
    if (role !== 'Recruiter' || !token) return;

    setError(null);
    setIsFetchingJobs(true);

    try {
      const jobsResponse = await api.get('/jobs', {
        params: { recruiterId: user._id },
      });

      if (jobsResponse.data && jobsResponse.data.jobs) {
        const filteredJobs = jobsResponse.data.jobs;
        setPostedJobs(filteredJobs);

        const applicationsResponse = await api.get('/auth/applications');
        if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
          setTotalApplications(applicationsResponse.data.length);
        }
      } else {
        setPostedJobs([]);
        setTotalApplications(0);
        setError('No jobs found');
      }
    } catch (error) {
      setPostedJobs([]);
      setTotalApplications(0);
      setError('Failed to load posted jobs. Please try again.');
    } finally {
      setIsFetchingJobs(false);
    }
  };

  useEffect(() => {
    fetchPostedJobs();
  }, [token, role, user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await api.put('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setProfilePicture(response.data.profilePicture);
        const updatedUser = { ...user };
        if (role === 'Job Seeker') {
          updatedUser.profilePicture = response.data.profilePicture;
        } else {
          updatedUser.company.logo = response.data.profilePicture;
        }
        dispatch(setUser({ token, role, user: updatedUser, fullName }));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    }
  };

  const profileVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const skillVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 200 },
    },
  };

  const loadingVariants = {
    animate: {
      rotate: 360,
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div variants={loadingVariants} animate="animate" className="flex flex-col items-center">
          <Briefcase className="h-12 w-12 text-teal-600" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-4 text-teal-600 font-semibold"
          >
            Loading your professional journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div
        variants={profileVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-4xl mx-auto p-6 mt-16"
      >
        <Card className="shadow-2xl border-none bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-700 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              {role === 'Job Seeker' ? (
                <>
                  <User className="h-8 w-8" />
                  Your Profile
                </>
              ) : (
                <>
                  <Building className="h-8 w-8" />
                  Recruiter Profile
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={profilePicture ? `http://localhost:5002${profilePicture}` : '/uploads/profiles/default-profile.jpg'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-teal-500"
                  onError={(e) => (e.target.src = '/uploads/profiles/default-profile.jpg')}
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-teal-600 text-white p-1 rounded-full cursor-pointer hover:bg-teal-700"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-6 w-6 text-teal-600" />
                  Personal Information
                </h2>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>
                    <strong>Name:</strong> {fullName || 'Not provided'}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email || 'Not provided'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user?.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {role === 'Job Seeker' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Briefcase className="h-6 w-6 text-teal-600" />
                    Applied Jobs
                  </h2>
                  <div className="space-y-4">
                    {applications.length > 0 ? (
                      applications.map((application) => (
                        <motion.div
                          key={application._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white rounded-lg shadow-md border border-gray-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {application.jobId?.title || 'Job Title Not Available'}
                              </h3>
                              <p className="text-gray-600">
                                {application.recruiterId?.company?.name || 'Company not specified'}
                              </p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-500">
                                  Applied on: {new Date(application.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm">
                                  Status:
                                  <span
                                    className={`font-medium ${
                                      application.status === 'Approved'
                                        ? 'text-green-600'
                                        : application.status === 'Not Hired'
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {application.status}
                                  </span>
                                </p>
                                {application.statusMessage && (
                                  <p className="text-sm text-gray-600 italic">{application.statusMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">You haven't applied to any jobs yet.</p>
                    )}
                  </div>
                </div>

                {!user?.resume || Object.keys(user.resume).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-red-600 text-xl"
                  >
                    No resume data found. Please create one.
                    <Button
                      asChild
                      className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 py-2 transform transition-all duration-300 hover:scale-105"
                    >
                      <Link to="/resume-builder">Create Resume</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-teal-600" />
                        Education
                      </h2>
                      <div className="mt-4 space-y-3">
                        {user.resume.education && Array.isArray(user.resume.education) && user.resume.education.length > 0 ? (
                          user.resume.education.map((edu, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-gray-100 rounded-lg shadow-sm"
                            >
                              <p className="text-gray-700">
                                <strong>{edu.degree}</strong> - {edu.institution} ({edu.year || 'N/A'})
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-600">No education details available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-teal-600" />
                        Experience
                      </h2>
                      <div className="mt-4 space-y-3">
                        {user.resume.experience && Array.isArray(user.resume.experience) && user.resume.experience.length > 0 ? (
                          user.resume.experience.map((exp, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-gray-100 rounded-lg shadow-sm"
                            >
                              <p className="text-gray-700">
                                <strong>{exp.jobTitle}</strong> - {exp.company} ({exp.duration || 'N/A'})
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-600">No experience details available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Code className="h-6 w-6 text-teal-600" />
                        Skills
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {user.resume.skills && Array.isArray(user.resume.skills) && user.resume.skills.length > 0 ? (
                          user.resume.skills.map((skill, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </motion.span>
                          ))
                        ) : (
                          <p className="text-gray-600">No skills listed</p>
                        )}
                      </div>
                    </div>

                    <Button
                      asChild
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 py-2 transform transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <Link to="/resume-builder">
                        <Edit className="h-5 w-5" />
                        Add Or Edit Resume
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}

            {role === 'Recruiter' && (
              <>
                {!user.company ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 bg-red-50 rounded-xl border border-red-100"
                  >
                    <Building className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 text-xl mb-4">No company profile found. Please set up your company.</p>
                    <Button
                      asChild
                      className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-3 transform transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      <Link to="/company-setup">
                        <Building className="h-5 w-5 mr-2" />
                        Set Up Company Profile
                      </Link>
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl text-white mb-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Quick Stats</h3>
                        <Building className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-lg">
                          <p className="text-sm opacity-80">Posted Jobs</p>
                          <p className="text-2xl font-bold">{postedJobs.length}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg">
                          <p className="text-sm opacity-80">Total Applications</p>
                          <p className="text-2xl font-bold">{totalApplications}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-gray-100 rounded-lg shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Company Information</h3>
                            <Button
                              asChild
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2 flex items-center gap-2"
                            >
                              <Link to="/company-setup">
                                <Edit className="h-4 w-4" />
                                Add Or Edit Company Profile
                              </Link>
                            </Button>
                          </div>
                          <p className="text-gray-700">
                            <strong>Company Name:</strong> {user.company?.name || 'Not provided'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Description:</strong> {user.company?.description || 'Not provided'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Location:</strong> {user.company?.location || 'Not provided'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Industry:</strong> {user.company?.industry || 'Not provided'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Size:</strong> {user.company?.size || 'Not provided'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Website:</strong>{' '}
                            {user.company?.website ? (
                              <a
                                href={user.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:underline"
                              >
                                {user.company.website}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                          <Briefcase className="h-6 w-6 text-teal-600" />
                          Posted Jobs
                        </h2>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2"
                          >
                            <Link to="/post-job">Post New Job</Link>
                          </Button>
                        </div>
                      </div>
                      {postedJobs.length > 0 ? (
                        postedJobs.map((job) => (
                          <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white rounded-lg shadow-md border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                                <p className="text-gray-600">{job.company}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-gray-500">
                                    Posted on: {new Date(job.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500">Location: {job.location}</p>
                                </div>
                              </div>
                              <Link
                                to={`/jobs/${job._id}`}
                                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                              >
                                View Details
                              </Link>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          {error ? (
                            <p className="text-red-600">{error}</p>
                          ) : (
                            <p className="text-gray-600">You haven't posted any jobs yet.</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResumeBuilder = () => {
  const { loading, role, user, token } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [resume, setResume] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ jobTitle: '', company: '', duration: '' }],
    skills: [''],
  });

  const [expandedSections, setExpandedSections] = useState({
    education: true,
    experience: true,
    skills: true,
  });

  const [status, setStatus] = useState({
    error: null,
    success: false,
    isValid: false,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (user?.resume) {
      setResume(user.resume);
    }
    validateForm();
  }, [user]);

  const handleChange = (e, index, type) => {
    const { name, value } = e.target;
    if (type === 'education' || type === 'experience') {
      const updated = resume[type].map((item, i) => (i === index ? { ...item, [name]: value } : item));
      setResume({ ...resume, [type]: updated });
    } else if (type === 'skills') {
      const updatedSkills = resume.skills.map((skill, i) => (i === index ? value : skill));
      setResume({ ...resume, skills: updatedSkills });
    } else {
      setResume({ ...resume, [name]: value });
    }
    validateForm();
  };

  const validateForm = () => {
    const isValid =
      resume.fullName.length > 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email) &&
      resume.education.every(edu => edu.degree && edu.institution) &&
      resume.experience.every(exp => exp.jobTitle && exp.company) &&
      resume.skills.every(skill => skill.length > 0);
    setStatus(prev => ({ ...prev, isValid }));
  };

  const addField = (type) => {
    if (type === 'education') setResume({ ...resume, education: [...resume.education, { degree: '', institution: '', year: '' }] });
    if (type === 'experience') setResume({ ...resume, experience: [...resume.experience, { jobTitle: '', company: '', duration: '' }] });
    if (type === 'skills') setResume({ ...resume, skills: [...resume.skills, ''] });
  };

  const removeField = (type, index) => {
    if (type === 'education') setResume({ ...resume, education: resume.education.filter((_, i) => i !== index) });
    if (type === 'experience') setResume({ ...resume, experience: resume.experience.filter((_, i) => i !== index) });
    if (type === 'skills') setResume({ ...resume, skills: resume.skills.filter((_, i) => i !== index) });
    validateForm();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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

      const profileData = {
        fullName: resume.fullName.trim(),
        email: resume.email.trim(),
        phoneNumber: resume.phoneNumber.trim(),
        resume: {
          fullName: resume.fullName.trim(),
          email: resume.email.trim(),
          phoneNumber: resume.phoneNumber.trim(),
          education: resume.education
            .filter(edu => edu.degree && edu.institution)
            .map(edu => ({
              degree: edu.degree.trim(),
              institution: edu.institution.trim(),
              year: edu.year.trim()
            })),
          experience: resume.experience
            .filter(exp => exp.jobTitle && exp.company)
            .map(exp => ({
              jobTitle: exp.jobTitle.trim(),
              company: exp.company.trim(),
              duration: exp.duration.trim()
            })),
          skills: resume.skills.filter(skill => skill.trim())
        }
      };

      const response = await api.put('/auth/profile', profileData);

      if (response.data && response.data.user) {
        // Update Redux with the full user object from the response
        dispatch(setUser({
          token,
          role,
          user: response.data.user, // Use the full user object returned from the backend
          fullName: response.data.user.fullName,
        }));

        setStatus(prev => ({ ...prev, success: true }));
        setTimeout(() => {
          navigate('/jobs');
        }, 1500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Failed to save resume';
      setStatus(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <motion.div className="max-w-4xl mx-auto p-6" variants={containerVariants} initial="hidden" animate="visible">
      <Card className="shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Build Your Resume</CardTitle>
          <p className="text-gray-600">Create a professional resume to showcase your skills</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="fullName" placeholder="Full Name *" value={resume.fullName} onChange={handleChange} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                <Input name="email" placeholder="Email *" value={resume.email} onChange={handleChange} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                <Input name="phoneNumber" placeholder="Phone Number" value={resume.phoneNumber} onChange={handleChange} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500 md:col-span-2" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('education')}>
                <h2 className="text-xl font-semibold text-gray-700">Education</h2>
                {expandedSections.education ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedSections.education &&
                resume.education.map((edu, index) => (
                  <motion.div key={index} variants={itemVariants} className="space-y-3 border-b pb-3 last:border-b-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input name="degree" placeholder="Degree *" value={edu.degree} onChange={(e) => handleChange(e, index, 'education')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                      <Input name="institution" placeholder="Institution *" value={edu.institution} onChange={(e) => handleChange(e, index, 'education')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                      <Input name="year" placeholder="Year" value={edu.year} onChange={(e) => handleChange(e, index, 'education')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                    </div>
                    {resume.education.length > 1 && (
                      <Button type="button" onClick={() => removeField('education', index)} className="text-red-600 hover:text-red-800 bg-transparent p-0">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              {expandedSections.education && (
                <Button type="button" onClick={() => addField('education')} className="mt-2 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                  <PlusCircle size={18} /> Add Education
                </Button>
              )}
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('experience')}>
                <h2 className="text-xl font-semibold text-gray-700">Experience</h2>
                {expandedSections.experience ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedSections.experience &&
                resume.experience.map((exp, index) => (
                  <motion.div key={index} variants={itemVariants} className="space-y-3 border-b pb-3 last:border-b-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input name="jobTitle" placeholder="Job Title *" value={exp.jobTitle} onChange={(e) => handleChange(e, index, 'experience')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                      <Input name="company" placeholder="Company *" value={exp.company} onChange={(e) => handleChange(e, index, 'experience')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                      <Input name="duration" placeholder="Duration" value={exp.duration} onChange={(e) => handleChange(e, index, 'experience')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500" />
                    </div>
                    {resume.experience.length > 1 && (
                      <Button type="button" onClick={() => removeField('experience', index)} className="text-red-600 hover:text-red-800 bg-transparent p-0">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              {expandedSections.experience && (
                <Button type="button" onClick={() => addField('experience')} className="mt-2 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                  <PlusCircle size={18} /> Add Experience
                </Button>
              )}
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('skills')}>
                <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
                {expandedSections.skills ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedSections.skills &&
                resume.skills.map((skill, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex items-center gap-3">
                    <Input placeholder="Skill *" value={skill} onChange={(e) => handleChange(e, index, 'skills')} className="transition-all duration-300 focus:ring-2 focus:ring-teal-500 flex-1" />
                    {resume.skills.length > 1 && (
                      <Button type="button" onClick={() => removeField('skills', index)} className="text-red-600 hover:text-red-800 bg-transparent p-0">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              {expandedSections.skills && (
                <Button type="button" onClick={() => addField('skills')} className="mt-2 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                  <PlusCircle size={18} /> Add Skill
                </Button>
              )}
            </motion.div>
            {status.error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {status.success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Resume saved successfully! Redirecting to jobs...</AlertDescription>
                </Alert>
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <Button type="submit" disabled={loading || !status.isValid} className="w-full bg-teal-600 hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Resume'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResumeBuilder;
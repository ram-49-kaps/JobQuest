import React, { useState } from 'react';
import yourImage from '/Users/kapadia/Desktop/Job-Portal/Frontend/src/Auth/Images/Leonardo_Phoenix_Create_a_3D_illustration_of_a_futuristic_tech_2.jpg';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import addPhoto from '/Users/kapadia/Desktop/Job-Portal/Frontend/src/Auth/Images/add-photo.png';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Shared/Logo';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser, clearUser } from '../redux/authSlice';
import api from '../api';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: '',
    companyName: '',
    companyDescription: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const { loading, token } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const changeEventHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'profilePicture') setProfilePicture(e.target.files?.[0]);
    if (e.target.name === 'companyLogo') setCompanyLogo(e.target.files?.[0]);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (formData.phoneNumber.length < 10) newErrors.phoneNumber = 'Phone number is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.role) newErrors.role = 'Role is required';
    if (formData.role === 'Recruiter') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.companyDescription) newErrors.companyDescription = 'Company description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (profilePicture) data.append('profilePicture', profilePicture);
    if (formData.role === 'Recruiter') {
      data.append('companyName', formData.companyName);
      data.append('companyDescription', formData.companyDescription);
      if (companyLogo) data.append('companyLogo', companyLogo);
    }

    try {
      dispatch(setLoading(true));
      const response = await api.post('/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data) {
        setIsRedirecting(true);
        localStorage.setItem('nextPath', formData.role === 'Recruiter' ? '/company-setup' : '/resume-builder');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Signup failed. Please try again.',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-xl text-gray-800 mb-4">You are already logged in!</p>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
            Logout
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="lg:block lg:w-1/2 relative">
        <img src={yourImage} alt="background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-100 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative">
          <div className="glass-morphism rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-5">
                <Logo />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">Create Account</h1>
              <p className="text-sm text-gray-600 mt-2">Join our community and start your journey</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input name="fullName" placeholder="Full Name" type="text" value={formData.fullName} onChange={changeEventHandler} className={`w-full ${errors.fullName ? 'border-red-500' : ''}`} disabled={loading} />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={changeEventHandler} className={`w-full ${errors.email ? 'border-red-500' : ''}`} disabled={loading} />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <Input name="phoneNumber" type="text" placeholder="Phone Number" value={formData.phoneNumber} onChange={changeEventHandler} className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`} disabled={loading} />
                {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>
              <div className="space-y-2 relative">
                <Input name="password" type={passwordVisible ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={changeEventHandler} className={`w-full ${errors.password ? 'border-red-500' : ''}`} disabled={loading} />
                <span className="absolute right-3 top-0.5 text-sm cursor-pointer text-gray-500 hover:text-gray-800" onClick={togglePasswordVisibility}>
                  {passwordVisible ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                </span>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))} disabled={loading}>
                  <SelectTrigger className={`w-full ${errors.role ? 'border-red-500' : 'border-input'}`}>
                    <SelectValue placeholder="Select Your Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>
              { formData.role === 'Job Seeker' &&
              <div className="space-y-2 border-dashed border-2 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300">
                <img src={addPhoto} className="w-6 h-6" alt="Add Profile Picture" />
                <Input accept="image/*" type="file" name="profilePicture" onChange={handleFileChange} className="cursor-pointer hover:text-[#176759]" disabled={loading} />
              </div>
              }
              {formData.role === 'Recruiter' && (
                <>
                  <div className="space-y-2">
                    <Input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={changeEventHandler} className={`w-full ${errors.companyName ? 'border-red-500' : ''}`} disabled={loading} />
                    {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Input name="companyDescription" placeholder="Company Description" value={formData.companyDescription} onChange={changeEventHandler} className={`w-full ${errors.companyDescription ? 'border-red-500' : ''}`} disabled={loading} />
                    {errors.companyDescription && <p className="text-sm text-red-500">{errors.companyDescription}</p>}
                  </div>
                  <div className="space-y-2 border-dashed border-2 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300">
                    <img src={addPhoto} className="w-6 h-6" alt="Add Company Logo" />
                    <Input accept="image/*" type="file" name="companyLogo" onChange={handleFileChange} className="cursor-pointer hover:text-[#176759]" disabled={loading} />
                  </div>
                </>
              )}
              {loading ? (
                <Button className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200" disabled>
                  <span className="mr-2 h-4 w-4 animate-spin">⌛</span>Please Wait...
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200">
                  Sign Up <FontAwesomeIcon icon={faRightToBracket} />
                </Button>
              )}
              {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-[#249885] hover:text-[#176759] transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          </div>
          {isRedirecting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-2xl">
              <div className="flex flex-col items-center text-white">
                <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-lg font-semibold">Redirecting to Login...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
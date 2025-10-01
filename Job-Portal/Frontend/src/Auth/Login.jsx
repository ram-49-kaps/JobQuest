import React, { useState } from 'react';
import yourImage from '/Users/kapadia/Desktop/Job-Portal/Frontend/src/Auth/Images/Leonardo_Phoenix_A_futuristic_digital_landscape_representing_a_3.jpg';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Shared/Logo';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '../redux/authSlice';
import { Loader2 } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      dispatch(setLoading(true));
      setErrors({});
  
      const loginResponse = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
  
      const { token, user } = loginResponse.data;
  
      if (!token || !user || !user.role) {
        throw new Error('Invalid response from server');
      }
  
      localStorage.setItem('token', token);
  
      dispatch(setUser({
        token,
        role: user.role,
        user: {
          _id: user.id,
          fullName: user.fullName || 'User',
          email: user.email,
          company: user.company || null,
        },
        fullName: user.fullName || 'User',
        logo: user.company?.logo || null,
        isProfileComplete: user.isProfileComplete
      }));
  
      setIsRedirecting(true);
      setTimeout(() => {
        setIsRedirecting(false);
        navigate(user.redirectPath || '/');
      }, 1500);
  
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Login failed. Please try again.',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

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
              <h1 className="text-2xl font-semibold text-gray-800">
                Login <FontAwesomeIcon icon={faRightToBracket} />
              </h1>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={changeEventHandler}
                  className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2 relative flex items-center">
                <Input
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={changeEventHandler}
                  className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <span
                  className="absolute right-3 top-0.5 text-sm cursor-pointer text-gray-500 hover:text-gray-800"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                </span>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <div className="flex justify-end items-end mt-2">
                <Button variant="link" className="text-[#249885] hover:text-[#176759] transition-colors">
                  <Link to="/forgotpassword">Forgot Password?</Link>
                </Button>
              </div>
              {loading ? (
                <Button className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait...
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200">
                  Login <FontAwesomeIcon icon={faRightToBracket} className="ml-2" />
                </Button>
              )}
              {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#249885] hover:text-[#176759] transition-colors">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
          {isRedirecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-2xl"
            >
              <div className="flex flex-col items-center text-white">
                <Loader2 className="animate-spin h-10 w-10 mb-4" />
                <p className="text-lg font-semibold">Login Successful...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
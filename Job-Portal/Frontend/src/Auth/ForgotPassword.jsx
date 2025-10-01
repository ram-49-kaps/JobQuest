import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/authSlice';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Shared/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message
  const { loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Handle email input change
  const changeEventHandler = (e) => {
    setEmail(e.target.value);
  };

  // Validate the email
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      if (validateForm()) {
        const response = await fetch('http://localhost:5002/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        const data = await response.json();
        
        if (response.ok) {
          setSuccessMessage('Temporary password has been sent to your email!');
          setEmail('');
          setErrors({});
          
          // Show alert and redirect after 2 seconds
          setTimeout(() => {
            alert('Please check your email for the temporary password. It will expire in 10 minutes.');
            window.location.href = '/login';
          }, 2000);
        } else {
          const errorMessage = data.message || 'Something went wrong. Please try again.';
          setErrors({ submit: errorMessage });
        }
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-morphism rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-5">
              <Logo />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Enter your email to receive a password reset link.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={changeEventHandler}
                className={`w-full ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              {errors.submit && (
                <p className="text-sm text-red-500">{errors.submit}</p>
              )}
            </div>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-green-600 text-center bg-green-100 p-2 rounded"
              >
                {successMessage}
              </motion.div>
            )}
            {loading ? (
              <Button className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-[#249885] hover:bg-[#176759] text-white transition-all duration-200"
              >
                Send Reset Link
              </Button>
            )}
            <p className="text-center text-sm text-gray-600 mt-4">
              Back to{' '}
              <Link
                to="/login"
                className="text-[#249885] hover:text-[#176759] transition-colors"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
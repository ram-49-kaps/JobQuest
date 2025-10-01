import React, { useState } from 'react';
import yourImage from '/Users/kapadia/Desktop/Job-Portal/Frontend/src/Auth/Leonardo_Phoenix_Create_a_3D_illustration_of_a_futuristic_tech_2.jpg'; 

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="flex w-3/4 lg:w-1/2 bg-white p-8 rounded-lg shadow-md">

        {/* Image Section (Left Side - Hidden on smaller screens) */}
        <div className="w-1/2 lg:w-1/2 hidden md:block pr-8">
          <img
            src={yourImage}
            alt="Signup Image"
            className="object-cover h-full rounded-l-lg"
          />
        </div>

        {/* Form Section (Right Side) */}
        <div className="w-1/2 lg:w-1/2">
          <h2 className="text-2xl font-bold text-center mb-4">
            Welcome to Design Community
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Already have an account?{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
          <form action="#" method="POST"> {/* Replace # with your form submission URL */}
            <input
              type="email"
              id="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              id="username"
              placeholder="Username"
              required
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative mb-4">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>Use 8 or more characters</li>
              <li>One Uppercase character</li>
              <li>One lowercase character</li>
              <li>One special character</li>
              <li>One number</li>
            </ul>
            <label className="inline-flex items-center mb-4">
              <input
                type="checkbox"
                id="subscribe"
                name="subscribe"
                className="form-checkbox h-4 w-4 text-blue-500 mr-2"
              />
              <span className="text-gray-700">
                I want to receive emails about the product, feature updates,
                events, and marketing promotions.
              </span>
            </label>
            <p className="text-center text-sm text-gray-600 mb-6">
              By creating an account, you agree to the{' '}
              <a href="#" className="text-blue-500 hover:underline">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-500 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Create an account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
////

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast({
        title: "Success!",
        description: "Your account has been created.",
        duration: 5000,
      });
      // Here you would typically handle the signup logic
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
          alt="Person working on laptop"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-[2px]" />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-morphism rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-800">Create Account</h1>
              <p className="text-sm text-gray-600 mt-2">Join our professional network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, role: value }));
                    if (errors.role) {
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.role ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job-seeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200"
              >
                Sign Up
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

JSX file

ximport { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast({
        title: "Success!",
        description: "Your account has been created.",
        duration: 5000,
      });
      // Here you would typically handle the signup logic
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
          alt="Person working on laptop"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-[2px]" />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4 py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] mx-auto"
        >
          <div className="glass-morphism rounded-2xl p-6 lg:p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Create Account</h1>
              <p className="text-sm text-gray-600">Join our professional network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 ${errors.fullName ? 'border-red-500' : 'border-input'}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 ${errors.email ? 'border-red-500' : 'border-input'}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 ${errors.password ? 'border-red-500' : 'border-input'}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Select
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, role: value }));
                    if (errors.role) {
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }
                  }}
                >
                  <SelectTrigger 
                    className={`w-full h-11 px-4 ${errors.role ? 'border-red-500' : 'border-input'}`}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job-seeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500 mt-1">{errors.role}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white transition-all duration-200"
                >
                  Sign Up
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;


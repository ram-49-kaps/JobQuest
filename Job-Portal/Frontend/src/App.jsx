import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "./admin/AdminLayout";
import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";
import JobsPage from "./admin/JobsPage";
import CandidatePage from "./admin/CandidatePage";
import CompaniesPage from "./admin/CompaniesPage";
import SettingsPage from "./admin/SettingsPage";
import NotFound from "./admin/NotFound";
import Index from "./admin/Index";

import Home from "./components/Home";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import ResumeBuilder from "./components/ResumeBuilder";
import RecruiterDashboard from './components/RecruiterDashboard';
import PostJob from './components/PostJob';
import Profile from "./components/Profile";
import CompanySetup from "./components/CompanySetup";
import ForgotPassword from "./Auth/ForgotPassword";
import Jobs from "./components/Jobs";
import JobDetails from "./components/JobDetails";
import AboutUs from "./components/AboutUsPage";
import ContactUs from "./components/ContactUsPage";
import SavedJobs from './components/SavedJobs';
import CompanyProfile from "./components/CompanyProfile";
import Applications from "./components/Applications";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/company-setup" element={<CompanySetup />} />
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/company-profile/:id" element={<CompanyProfile />} />
            <Route path="/jobs" element={<Jobs />} /> {/* Removed hardcoded jobs prop */}
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/applications" element={<Applications />} />
            
            <Route path="/index" element={<Index/>} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="candidates" element={<CandidatePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
          
            <Route path="*" element={<NotFound />} />
            // Add this to your routes
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
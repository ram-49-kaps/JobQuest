import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';
import StatCard from "./StatCard";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[#249885] to-[#1a1a1a] text-white py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#249885] leading-tight">
              Transforming Careers with JobQuest
            </h1>
            <p className="text-xl md:text-2xl opacity-80 font-light">
              Your Gateway to Professional Success
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section with updated content */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Vision & Mission
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                JobQuest is dedicated to revolutionizing the job search experience. We combine cutting-edge technology with human-centric approaches to create meaningful connections between talented individuals and forward-thinking companies.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our platform offers:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Smart job matching algorithms</li>
                <li>Seamless application processes</li>
                <li>Professional networking opportunities</li>
                <li>Career development resources</li>
              </ul>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-[#249885] hover:bg-[#18685b] px-8 rounded-full"
              >
                Start Your Journey
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Team collaboration"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Updated Stats Section with real numbers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Our Growing Impact
            </h2>
            <p className="text-gray-600 mt-2">
              Trusted by thousands of job seekers and companies worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard
              number="100k+"
              title="Active Users"
              description="Job seekers finding their dream roles"
            />
            <StatCard
              number="50k+"
              title="Job Postings"
              description="New opportunities added monthly"
            />
            <StatCard
              number="15k+"
              title="Companies"
              description="Trusted employers hiring through us"
            />
            <StatCard
              number="95%"
              title="Success Rate"
              description="Satisfaction among our users"
            />
          </div>
        </div>
      </section>

      {/* Team Section with real team members */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Leadership Team
            </h2>
            <p className="text-gray-600 mt-2">
              Meet the experts behind JobQuest's success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <img
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Ram Kapadia"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900">Ram Kapadia</h3>
              <p className="text-gray-600">Founder & CEO</p>
              <p className="text-gray-500 mt-2 text-sm">
                10+ years in Tech & HR Solutions
              </p>
            </div>
            {/* Add more team members similarly */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
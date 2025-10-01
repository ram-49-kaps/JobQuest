import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, MapPin, Users, Building } from "lucide-react";
import HeroStats from "@/components/HeroStats";
import CategoryCard from "@/components/CategoryCard";
import JobCard from "@/components/JobCard";
import CompanyLogos from "@/components/CompanyLogos";
import StatCard from "@/components/StatCard";
import TestimonialCard from "@/components/TestimonialCard";
import BlogCard from "@/components/BlogCard";
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';
import axios from "axios";

const Home = () => {
  const Navigate = useNavigate();
  const [searchItem, setSearchItem] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]); // Add state for recentJobs

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/stats');
        const { stats: fetchedStats, featuredCompanies, recentJobs, categories } = response.data;
        
        // Log the raw recentJobs data to debug
        console.log('Fetched recentJobs:', recentJobs);
        
        // Transform recentJobs to ensure required fields are present
        const transformedJobs = (recentJobs || []).map(job => ({
          ...job,
          skills: job.skills || [], // Add default empty array for skills
        }));
        
        // Log the transformed data to verify
        console.log('Transformed recentJobs:', transformedJobs);
        
        setStats({
          totalJobs: fetchedStats.totalJobs || 0,
          totalCandidates: fetchedStats.candidates?.totalCandidates || 0,
          totalCompanies: fetchedStats.companies?.totalCompanies || 0,
          candidateStats: {
            experienceLevels: fetchedStats.candidates?.experienceLevels || {},
            skills: fetchedStats.candidates?.skills || {}
          },
          companyStats: {
            industries: fetchedStats.companies?.industries || [],
            locations: fetchedStats.companies?.locations || []
          },
          featuredCompanies: featuredCompanies || []
        });
        setLocations(fetchedStats.companies?.locations || []);
        setCategories(categories || []);
        setRecentJobs(transformedJobs); // Set the transformed jobs
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
        setLoading(false);
      }
    };
  
    fetchStats();
  }, []);

  const heroStats = [
    { 
      icon: <Briefcase className="h-10 w-10 transition-transform duration-300 ease-in-out hover:scale-110" />, 
      label: "Jobs", 
      count: loading ? "Loading..." : stats?.totalJobs.toString()
    },
    { 
      icon: <Users className="h-10 w-10 transition-transform duration-300 ease-in-out hover:scale-110" />, 
      label: "Candidates", 
      count: loading ? "Loading..." : stats?.totalCandidates.toString()
    },
    { 
      icon: <Building className="h-10 w-10 transition-transform duration-300 ease-in-out hover:scale-110" />, 
      label: "Companies", 
      count: loading ? "Loading..." : stats?.totalCompanies.toString()
    },
  ];

  const testimonials = [];
  const blogPosts = [];

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Photo Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-64 h-64 bg-[url('https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=300')] bg-cover bg-center opacity-10 rounded-full absolute -top-32 -left-32 transition-all duration-500 ease-in-out hover:opacity-20"></div>
        <div className="w-48 h-48 bg-[url('https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300')] bg-cover bg-center opacity-10 rounded-full absolute -bottom-24 -right-24 transition-all duration-500 ease-in-out hover:opacity-20"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[#249885] to-[#1a1a1a] text-white py-24 relative z-10 overflow-hidden transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12 transition-all duration-500 ease-in-out hover:scale-105">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#249885] leading-tight transition-all duration-300 ease-in-out hover:tracking-wider">
              Embark on Your Career Quest!
            </h1>
            <p className="text-xl md:text-2xl opacity-80 font-light tracking-wide transition-all duration-300 ease-in-out hover:opacity-100">
              Discover opportunities that ignite your passion and shape your future.
            </p>
          </div>
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 flex flex-col md:flex-row gap-4 transform transition-all duration-500 ease-in-out hover:shadow-[#249885]/60 hover:scale-[1.03]">
            <div className="flex-1 flex items-center px-4 py-2 bg-gray-100 rounded-lg ">
              <Search className="text-gray-500 h-6 w-6 mr-3 transition-transform duration-300 ease-in-out hover:scale-110" />
              <input
                type="text"
                placeholder="Search Jobs or Companies"
                className="outline-none bg-transparent w-full text-gray-800 placeholder-gray-400 transition-all duration-300 ease-in-out border-0 hover:placeholder-gray-500"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    Navigate(`/jobs?search=${searchItem}&location=${location}&category=${category}`);
                  }
                }}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2">
              <MapPin className="text-gray-500 h-6 w-6 mr-3 transition-transform duration-300 ease-in-out hover:scale-110" />
              <select
                className="outline-none bg-transparent w-full text-gray-800 transition-all duration-300 ease-in-out hover:text-gray-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center px-4 py-2  rounded-lg ">
              <Briefcase className="text-gray-500 h-6 w-6 mr-3 transition-transform duration-300 ease-in-out hover:scale-110" />
              <select
                className="outline-none bg-transparent w-full text-gray-800 transition-all duration-300 ease-in-out hover:text-gray-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={() => Navigate(`/jobs?search=${searchItem}&location=${location}&category=${category}`)}
              className="bg-[#249885] hover:bg-[#18685b] px-6 rounded-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg">
              <Search className="h-5 w-5 mr-2 transition-transform duration-300 ease-in-out hover:rotate-12" /> Explore Now
            </Button>
          </div>
          <HeroStats
            stats={heroStats}
            className={`mt-12 ${loading ? 'opacity-70' : ''}`}
          />
          {error && (
            <div className="text-red-500 text-center mt-4">{error}</div>
          )}
        </div>
      </section>

      <CompanyLogos className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-500 ease-in-out" />

      {/* Recent Jobs */}
      <section className="py-16 bg-white relative transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12 transition-all duration-300 ease-in-out">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-[#249885] to-[#18685b] transition-all duration-300 ease-in-out hover:tracking-wider">
                Fresh Opportunities Await
              </h2>
              <p className="text-gray-600 mt-2 italic transition-all duration-300 ease-in-out hover:text-gray-800">Your next big break is just a click away!</p>
            </div>
            <Button
              onClick={() => Navigate("/jobs")}
              className="bg-[#249885] hover:bg-[#18685b] rounded-full px-8 transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
            >
              Discover All Jobs
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.length > 0 ? (
              recentJobs.map((job, index) => (
                <JobCard
                  key={job._id} // Use _id instead of id
                  job={job}
                  className={`transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl animate-fade-in-up delay-${index * 100}`}                />
              ))
            ) : (
              <p className="text-gray-600 text-center col-span-full">No recent jobs available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 transition-all duration-300 ease-in-out">
            <h2 className="text-4xl font-bold text-gray-900 transition-all duration-300 ease-in-out hover:tracking-wider">Explore Your Path</h2>
            <p className="text-gray-600 mt-2 font-medium transition-all duration-300 ease-in-out hover:text-gray-800">Dive into industries that inspire you.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                name={category.name}
                icon={category.icon}
                count={category.count}
                className="transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white relative transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="office team"
                className="rounded-xl w-full h-auto object-cover shadow-lg transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl"
                style={{ maxHeight: "500px" }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#249885] rounded-full opacity-20 transition-all duration-500 ease-in-out hover:opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight transition-all duration-300 ease-in-out hover:tracking-wider">
                Build a Life You Love
              </h2>
              <p className="text-gray-700 mb-8 transition-all duration-300 ease-in-out hover:text-gray-900">
                Step into a career that aligns with your dreams. Join a community where your talents shine and your future thrives.
              </p>
              <div className="flex gap-4">
                <Button className="bg-[#249885] hover:bg-[#18685b] px-8 rounded-full transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg
                "
                onClick={() => Navigate("/signup")}
                >
                  Start Your Quest
                </Button>
                
                <Button
                  variant="outline"
                  className="border-[#249885] text-[#249885] hover:bg-[#249885] hover:text-white rounded-full px-8 transition-all duration-300 ease-in-out hover:shadow-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
              number="12k+"
              title="Clients Worldwide"
              description="Connecting talent globally with unmatched opportunities."
              className="bg-white shadow-lg rounded-xl p-6 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            />
            <StatCard
              number="20k+"
              title="Active Resumes"
              description="Ready-to-hire talent at your fingertips."
              className="bg-white shadow-lg rounded-xl p-6 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            />
            <StatCard
              number="18k+"
              title="Companies"
              description="Partnered with industry leaders for your success."
              className="bg-white shadow-lg rounded-xl p-6 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-[#249885] to-[#1a1a1a] text-white transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 transition-all duration-300 ease-in-out">
            <h2 className="text-4xl font-bold transition-all duration-300 ease-in-out hover:tracking-wider">Voices of Success</h2>
            <p className="text-gray-300 mt-2 transition-all duration-300 ease-in-out hover:text-gray-100">Hear from those who found their calling with us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-6 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl animate-fade-in-up delay-${index * 100}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-16 bg-white transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12 transition-all duration-300 ease-in-out">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 transition-all duration-300 ease-in-out hover:tracking-wider">Insights & Updates</h2>
              <p className="text-gray-600 mt-2 transition-all duration-300 ease-in-out hover:text-gray-800">Stay ahead with the latest career trends.</p>
            </div>
            <a href="#" className="text-[#249885] hover:underline font-semibold transition-all duration-300 ease-in-out hover:text-[#18685b]">Explore All</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                className="transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
              />
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
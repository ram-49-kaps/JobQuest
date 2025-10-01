import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Map } from "lucide-react";
import Navbar from './Shared/Navbar';
import Footer from './Shared/Footer';

const ContactUs = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission (replace with actual API call if needed)
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 3000);
  };

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
              Contact JobQuest
            </h1>
            <p className="text-xl md:text-2xl opacity-80 font-light tracking-wide transition-all duration-300 ease-in-out hover:opacity-100">
              We’re here to assist you on your career journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white relative transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg rounded-xl p-8 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 transition-all duration-300 ease-in-out hover:tracking-wider">
                Get in Touch
              </h2>
              {submitted ? (
                <p className="text-green-600 font-semibold mb-6 transition-all duration-300 ease-in-out">
                  Thank you! Your message has been sent successfully.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2 transition-all duration-300 ease-in-out hover:text-gray-900">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249885] transition-all duration-300 ease-in-out"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2 transition-all duration-300 ease-in-out hover:text-gray-900">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249885] transition-all duration-300 ease-in-out"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2 transition-all duration-300 ease-in-out hover:text-gray-900">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249885] transition-all duration-300 ease-in-out h-32 resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#249885] hover:bg-[#18685b] rounded-full transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 transition-all duration-300 ease-in-out hover:tracking-wider">
                Reach Out
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#249885] transition-transform duration-300 ease-in-out hover:scale-110" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                    <p className="text-gray-600 transition-all duration-300 ease-in-out hover:text-gray-800">
                      support@jobquest.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-[#249885] transition-transform duration-300 ease-in-out hover:scale-110" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                    <p className="text-gray-600 transition-all duration-300 ease-in-out hover:text-gray-800">
                      900-123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Map className="h-6 w-6 text-[#249885] transition-transform duration-300 ease-in-out hover:scale-110" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
                    <p className="text-gray-600 transition-all duration-300 ease-in-out hover:text-gray-800">
                     SURAT,GUJARAT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#249885] to-[#1a1a1a] text-white transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 transition-all duration-300 ease-in-out hover:tracking-wider">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl opacity-80 mb-8 transition-all duration-300 ease-in-out hover:opacity-100">
            Sign up today and explore a world of opportunities with JobQuest.
          </p>
          <Button
            onClick={() => navigate("/signup")}
            className="bg-white text-[#249885] hover:bg-gray-100 px-8 rounded-full transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
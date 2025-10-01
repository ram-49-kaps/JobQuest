import React from 'react'
import NewsletterForm from '../NewsletterForm'
import Logo from './Logo'

function Footer() {
  return (
    <div>
       <footer className="bg-gradient-to-t from-[#070707] to-[#1a1a1a] text-white pt-20 pb-8 relative transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6 transition-all duration-300 ease-in-out">
                <Logo className="h-8 w-8 mr-2 " />
                &nbsp;
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#249885] transition-all duration-300 ease-in-out hover:tracking-wider">JobQuest</h3>
              </div>
              <p className="text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-200">Your journey to a fulfilling career starts here. Let’s make it happen.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#249885] transition-all duration-300 ease-in-out hover:text-[#18685b]">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Our Team", "Partners", "For Candidates", "For Employers"].map((item) => (
                  <li key={item}><a href="#" className="text-gray-400 hover:text-[#249885] transition-all duration-300 ease-in-out">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#249885] transition-all duration-300 ease-in-out hover:text-[#18685b]">Job Categories</h4>
              <ul className="space-y-3">
                {["Telecommunications", "Hotels & Tourism", "Construction", "Education", "Financial Services"].map((item) => (
                  <li key={item}><a href="#" className="text-gray-400 hover:text-[#249885] transition-all duration-300 ease-in-out">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#249885] transition-all duration-300 ease-in-out hover:text-[#18685b]">Stay Connected</h4>
              <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out hover:text-gray-200">Subscribe for career tips and updates.</p>
              <NewsletterForm className="bg-white/10 p-4 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg" />
            </div>
          </div>
          <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center transition-all duration-300 ease-in-out">
            <p className="text-gray-500 mb-4 md:mb-0 transition-all duration-300 ease-in-out hover:text-gray-300">© 2025 JobQuest. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-[#249885] transition-all duration-300 ease-in-out">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-[#249885] transition-all duration-300 ease-in-out">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer

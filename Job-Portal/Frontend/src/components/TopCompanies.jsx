import React from 'react';
import { Building2 } from 'lucide-react';

const TopCompanies = ({ companies }) => {
  const baseURL = 'http://localhost:5002'; // Adjust this to your backend URL

  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Top Companies</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover leading companies with exciting job opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto max-w-6xl">
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <div
                key={company.id || company._id || company.name} // Use id, _id, or name as fallback
                className="company-card flex flex-col items-center text-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 mb-4 overflow-hidden">
                  {company.logo ? (
                    <img
                      src={`${baseURL}${company.logo}`} // Prepend base URL
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = '/uploads/profiles/default-company.jpg'; // Fallback image
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{company.name}</h3>
                <span className="mt-auto text-sm bg-[#e0f1ee] text-[#249885] px-3 py-1 rounded-full">
                  {company.jobCount || 0} open jobs
                </span>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">No top companies available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopCompanies;
import React from "react";

const StatCard = ({ number, title, description, className }) => {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <h3 className="text-4xl font-bold text-[#249885] mb-2">{number}</h3>
      <h4 className="text-xl font-semibold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default StatCard;

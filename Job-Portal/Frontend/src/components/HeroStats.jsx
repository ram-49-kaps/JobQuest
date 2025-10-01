import React from "react";

const HeroStats = ({ stats }) => {
  return (
    <div className="flex flex-wrap justify-center gap-10 mt-16">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center">
          <div className="bg-[#249885] p-3 rounded-full mr-4">
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-gray-300">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const CategoryCard = ({ name, icon, count }) => {
  return (
    <Card className="hover:shadow-md transition-all hover:border-[#155a4f] hover:scale-105 bg-white">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-admin-primary bg-admin-primary/10 px-2 py-1 rounded-full">
          {count} jobs
        </p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;

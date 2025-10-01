import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewsletterForm = () => {
  return (
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="Email Address"
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
      />
      <Button className="w-full bg-[#249885] hover:bg-[#155a4f]">
        Subscribe now
      </Button>
    </div>
  );
};

export default NewsletterForm;

import React from "react";
import { ArrowRight } from "lucide-react";

const BlogCard = ({ post }) => {
  return (
    <div className="flex flex-col">
      <div className="relative mb-4">
        <span className="absolute top-4 left-4 bg-admin-primary text-white text-sm px-3 py-1 rounded-full">
          {post.category}
        </span>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      <div className="mb-3 text-gray-500">{post.date}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{post.title}</h3>
      <a href="#" className="text-admin-primary flex items-center group">
        Read more <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
};

export default BlogCard;

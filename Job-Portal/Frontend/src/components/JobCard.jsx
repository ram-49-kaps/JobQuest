import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BookmarkPlus, MapPin, Building, Clock, Briefcase, ArrowUpRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
const JobCard = ({ job }) => {
  console.log('JobCard job data:', job); // Debug log to verify logo
  const navigate = useNavigate();

  const handleApplyClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <Card className={`overflow-hidden transition-all hover:border-blue-300 hover:shadow-md ${job.featured ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
      {job.featured && (
        <div className="bg-blue-600 py-1 px-3 text-[10px] font-medium text-white absolute right-0 top-4 rounded-l-full">
          Featured
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-md border flex-shrink-0 overflow-hidden">
            {job.logo ? (
              <img
                src={`http://localhost:5002${job.logo}`} // Adjust base URL as needed
                alt={`${job.company} logo`}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/uploads/profiles/default-company.jpg';
                }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800 text-xl font-semibold text-gray-600 dark:text-gray-300">
                {job.company?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Building size={14} />
                    <span>{job.company}</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title="Save job">
                <BookmarkPlus size={18} />
                <span className="sr-only">Bookmark</span>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200">
                <Briefcase size={12} className="mr-1" />
                {job.jobType}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200">
                {job.salary}
              </Badge>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Posted <span className="font-medium">{job.timeAgo}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button  className="bg-[#249885] hover:bg-[#18685b] text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => handleApplyClick(job._id)}
          >
            Apply Now <ArrowUpRight size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import api from '../api';

const JobsSearchFilter = ({ filters, onFilterChange, onSortChange, sortBy }) => {
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryRange, setSalaryRange] = useState([0, 200]);
  const [experienceLevel, setExperienceLevel] = useState(filters.experience ? [filters.experience] : []);
  const [jobType, setJobType] = useState(filters.jobType ? [filters.jobType] : []);
  const [location, setLocation] = useState(filters.location || '');
  const [searchKeywords, setSearchKeywords] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    jobTypes: [],
    experienceLevels: [],
  });
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [errorFilters, setErrorFilters] = useState(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoadingFilters(true);
        const response = await api.get('/jobs/filters');
        setFilterOptions(response.data);
        setLoadingFilters(false);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        setErrorFilters('Failed to load filter options');
        setLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const normalizeJobType = (type) => {
    if (!type) return '';
    return type.toLowerCase();
  };

  const normalizeExperience = (level) => {
    const experienceMap = {
      'Entry': 'Entry Level',
      'Mid': 'Mid Level',
      'Senior': 'Senior Level',
      'Executive': 'Executive'
    };
    return experienceMap[level] || level;
  };

  const clearAllFilters = () => {
    setRemoteOnly(false);
    setSalaryRange([0, 200]);
    setExperienceLevel([]);
    setJobType([]);
    setLocation('');
    setSearchKeywords('');
    onFilterChange({
      jobType: '',
      experience: '',
      location: '',
      industry: '',
      search: '',
      minSalary: '',
      maxSalary: ''
    });
  };

  const handleExperienceLevelChange = (value) => {
    const newExperience = experienceLevel.includes(value)
      ? experienceLevel.filter((level) => level !== value)
      : [value];
    setExperienceLevel(newExperience);
  };

  const handleJobTypeChange = (value) => {
    if (value === 'Remote') {
      setRemoteOnly(true);
      setJobType(['Remote']);
    } else {
      setRemoteOnly(false);
      setJobType(jobType.includes(value) ? [] : [value]);
    }
  };

  const handleApplyFilters = () => {
    const newFilters = {
      jobType: normalizeJobType(remoteOnly ? 'Remote' : (jobType[0] || '')),
      experience: normalizeExperience(experienceLevel[0] || ''),
      location: location,
      industry: filters.industry || '',
      search: searchKeywords.trim(),
      minSalary: salaryRange[0] === 0 ? '' : salaryRange[0] * 1000,
      maxSalary: salaryRange[1] === 200 ? '' : salaryRange[1] * 1000
    };
    console.log('Filters being applied:', newFilters);
    onFilterChange(newFilters);
  };

  if (loadingFilters) {
    return <div>Loading filters...</div>;
  }

  if (errorFilters) {
    return <div>{errorFilters}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="sticky top-6 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Filter size={18} />
            Job Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={14} className="mr-2" />
            Clear All
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Keywords */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Label htmlFor="keywords" className="text-sm font-medium text-gray-700 dark:text-gray-300">Keywords</Label>
            <Input 
              id="keywords" 
              placeholder="e.g. React, Designer"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </motion.div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
            <Input 
              id="location" 
              placeholder="City, state, or zip code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="remote-only" className="text-sm cursor-pointer">Remote Only</Label>
              <Switch 
                id="remote-only" 
                checked={remoteOnly} 
                onCheckedChange={(checked) => {
                  setRemoteOnly(checked);
                  if (checked) {
                    setJobType(['Remote']);
                  } else {
                    setJobType(jobType.filter(type => type !== 'Remote'));
                  }
                }} 
              />
            </div>
          </div>

          <Separator />

          {/* Salary Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Salary Range</Label>
              <span className="text-sm font-semibold text-teal-500">
                ${salaryRange[0]}K - ${salaryRange[1]}K
              </span>
            </div>
            <Slider
              defaultValue={[0, 200]}
              min={0}
              max={200}
              step={1}
              value={salaryRange}
              onValueChange={(value) => setSalaryRange(value)}
              className="py-2"
            />
          </div>

          <Separator />

          {/* Job Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Job Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.jobTypes.map((type) => (
                <motion.div whileHover={{ scale: 1.05 }} key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`job-type-${type}`}
                    checked={jobType.includes(type)}
                    onCheckedChange={() => handleJobTypeChange(type)}
                  />
                  <label htmlFor={`job-type-${type}`} className="text-sm">{type}</label>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Experience Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.experienceLevels.map((level) => (
                <motion.div whileHover={{ scale: 1.05 }} key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`experience-${level}`}
                    checked={experienceLevel.includes(level)}
                    onCheckedChange={() => handleExperienceLevelChange(level)}
                  />
                  <label htmlFor={`experience-${level}`} className="text-sm">{level}</label>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Apply Filters Button */}
          <Button 
            className="w-full mt-6" 
            onClick={handleApplyFilters}
            variant="default"
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JobsSearchFilter;

export const filterJobs = (jobs, filters) => {
  if (!jobs || !Array.isArray(jobs)) return [];
  
  return jobs.filter(job => {
    // Search term filter (job title or company)
    if (filters.searchTerm && 
        !job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !job.company.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Location filter
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Category/Industry filter
    if (filters.categories.length > 0 && !filters.categories.includes(job.industry)) {
      return false;
    }

    // Job type filter
    if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.jobType)) {
      return false;
    }

    // Salary range filter (basic implementation)
    if (filters.salaryRange !== 50) {
      const maxSalary = 10000; // Example max salary
      const currentMaxSalary = (filters.salaryRange / 100) * maxSalary;
      
      // Extract numeric part from salary range (e.g., "$40000-$42000" -> 42000)
      const salaryParts = job.salary.split('-');
      const maxJobSalary = parseInt(salaryParts[salaryParts.length - 1].replace(/\D/g, ''));
      
      if (maxJobSalary > currentMaxSalary) {
        return false;
      }
    }

    // Date posted filter would typically use actual dates
    // For now, we'll just implement a simple filter based on time strings
    if (filters.datePosted !== 'all') {
      switch (filters.datePosted) {
        case 'lastHour':
          if (!job.timeAgo.includes('min')) return false;
          break;
        case 'last24Hours':
          if (job.timeAgo.includes('day') || job.timeAgo.includes('month')) return false;
          break;
        case 'last7Days':
          if (job.timeAgo.includes('month')) return false;
          break;
        // More cases can be added
      }
    }

    return true;
  });
};

// Function to get salary range text based on slider value
export const getSalaryRangeText = (value) => {
  const maxSalary = 10000;
  const currentMaxSalary = Math.round((value / 100) * maxSalary);
  return `$0 - $${currentMaxSalary}`;
};

// Helper to count jobs by category
export const countJobsByCategory = (jobs, category) => {
  if (!jobs || !Array.isArray(jobs)) return 0;
  return jobs.filter(job => job.industry === category).length;
};

// Helper to count jobs by job type
export const countJobsByJobType = (jobs, jobType) => {
  if (!jobs || !Array.isArray(jobs)) return 0;
  return jobs.filter(job => job.jobType === jobType).length;
};

// Helper to count jobs by experience level (assume we would have this property)
export const countJobsByExperienceLevel = (jobs, level) => {
  if (!jobs || !Array.isArray(jobs)) return 0;
  // In a real app, job would have an experienceLevel property
  // For now, return a mock count
  return Math.floor(Math.random() * 10) + 1;
};

// Helper to count jobs by date posted
export const countJobsByDatePosted = (jobs, dateFilter) => {
  if (!jobs || !Array.isArray(jobs)) return 0;
  
  switch (dateFilter) {
    case 'all':
      return jobs.length;
    case 'lastHour':
      return jobs.filter(job => job.timeAgo.includes('min')).length;
    case 'last24Hours':
      return jobs.filter(job => !job.timeAgo.includes('day') && !job.timeAgo.includes('month')).length;
    case 'last7Days':
      return jobs.filter(job => !job.timeAgo.includes('month')).length;
    default:
      return 0;
  }
};

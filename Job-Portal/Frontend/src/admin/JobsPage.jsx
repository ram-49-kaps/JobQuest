import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from './Api/api';
import { setLoading } from '../redux/authSlice';

function JobsPage() {
  // Update the initial state to ensure it's an array
  const [jobs, setJobs] = React.useState([]);
  
  const [editingJob, setEditingJob] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const dispatch = useDispatch();
  const { loading, logo } = useSelector((state) => state.auth);

  // Utility function for minimum loading duration
  const withMinimumLoading = async (callback, minDuration = 1500) => {
    dispatch(setLoading(true));
    const startTime = Date.now();
    try {
      const result = await callback();
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minDuration - elapsedTime;
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      localStorage.setItem('adminToken', 'static-jwt-token-123456');
      toast.success('Simulated login successful');
    }
    fetchJobs();
  }, [dispatch]);

  const fetchJobs = async () => {
    await withMinimumLoading(async () => {
      const response = await api.get('/jobs');
      // Ensure we're setting an array of jobs
      setJobs(Array.isArray(response.data) ? response.data : 
              Array.isArray(response.data.jobs) ? response.data.jobs : []);
    }).catch((error) => {
      console.error('Fetch jobs error:', error);
      setJobs([]); // Set empty array on error
      toast.error('Failed to fetch jobs', {
        description: error.response?.data?.message || 'Please check your connection',
      });
    });
  };

  // Update handleAddJob to safely update the jobs array
  const handleAddJob = async () => {
    const newJob = {
      title: 'New Job',
      company: 'New Company',
      location: 'Location',
      type: 'Full-time',
      status: 'Active',
    };

    await withMinimumLoading(async () => {
      const response = await api.post('/jobs', newJob);
      setJobs(prevJobs => [...(Array.isArray(prevJobs) ? prevJobs : []), response.data]);
      toast.success('Job added successfully');
    }).catch((error) => {
      toast.error('Failed to add job', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    });
  };

  const handleEditClick = (job) => {
    setEditingJob({ ...job });
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingJob(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;

    await withMinimumLoading(async () => {
      const response = await api.put(`/jobs/${editingJob._id}`, editingJob);
      setJobs(jobs.map(job => 
        job._id === editingJob._id ? response.data : job
      ));
      toast.success('Job updated successfully', {
        description: `${editingJob.title} has been updated.`,
      });
      setDialogOpen(false);
      setEditingJob(null);
    }).catch((error) => {
      toast.error('Failed to update job', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    });
  };

  const handleDelete = async (id) => {
    await withMinimumLoading(async () => {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id));
      toast.success('Job deleted successfully');
    }).catch((error) => {
      toast.error('Failed to delete job', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    });
  };

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            {logo ? (
              <img
                src={logo}
                alt="Loading Logo"
                className="w-32 h-32 animate-pulse mx-auto rounded-full"
              />
            ) : (
              <p className="text-white">Logo not found</p>
            )}
            <p className="text-white mt-4 text-lg">Loading...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Jobs Management</h1>
            <p className="text-gray-500">Manage all job postings</p>
          </div>
          <Button 
            className="bg-admin-primary hover:bg-admin-light"
            onClick={handleAddJob}
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Job
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job._id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{job.location}</span>
                      <span>{job.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditClick(job)}
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(job._id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Make changes to the job posting here.
              </DialogDescription>
            </DialogHeader>
            
            {editingJob && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={editingJob.title}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={editingJob.company}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={editingJob.location}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Job Type</Label>
                  <Input
                    id="type"
                    name="type"
                    value={editingJob.type}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    value={editingJob.status}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={loading}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default JobsPage;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setLoading } from '../redux/authSlice';
import api from './Api/api';
import { toast } from 'sonner';

function DashboardPage() {
  const dispatch = useDispatch();
  const { loading, logo } = useSelector((state) => state.auth);

  const [stats, setStats] = React.useState([]);
  const [recentJobs, setRecentJobs] = React.useState([]);

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
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No token found, please log in again');
        return;
      }

      await withMinimumLoading(async () => {
        const statsResponse = await api.get('/dashboard/stats');
        const jobsResponse = await api.get('/dashboard/recent-jobs');

        setStats(statsResponse.data.map(stat => ({
          title: stat.title,
          value: stat.value,
          change: stat.change,
          icon: {
            'Total Jobs': Briefcase,
            'Active Candidates': Users,
            'Total Applications': TrendingUp,
            'Hired Candidates': DollarSign,
          }[stat.title],
          color: stat.color,
        })));

        setRecentJobs(jobsResponse.data);
      }).catch((error) => {
        toast.error('Failed to fetch dashboard data', {
          description: error.response?.data?.message || 'Please check your connection',
        });
      });
    };

    fetchDashboardData();
  }, [dispatch]);

  const SkeletonStatCard = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="p-3 bg-gray-200 rounded-lg">
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonJobCard = () => (
    <div className="py-4 flex items-center justify-between animate-pulse">
      <div>
        <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
  );

  // Remove the loading overlay JSX and keep only the skeleton loaders
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your admin panel - March 17, 2025</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Job Postings</CardTitle>
                <div className="w-24 h-9 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                <SkeletonJobCard />
                <SkeletonJobCard />
                <SkeletonJobCard />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500"> from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Job Postings</CardTitle>
                <Button
                  variant="outline"
                  className="text-admin-primary border-admin-primary hover:bg-admin-primary/10"
                  onClick={() => window.location.href = '/admin/jobs'}
                  disabled={loading}
                >
                  View All Jobs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentJobs.map((job) => (
                  <div key={job.title} className="py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-500">
                        {job.applicants} applicants • {job.date}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        job.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
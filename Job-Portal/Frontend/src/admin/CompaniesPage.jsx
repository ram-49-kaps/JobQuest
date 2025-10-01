import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/authSlice';
import api from './Api/api';

const CompaniesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, logo } = useSelector((state) => state.auth || {});
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen]= useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    location: '',
    employees: 0,
    website: '',
    status: 'Active',
  });

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
    const fetchCompanies = async () => {
      const token = localStorage.getItem('adminToken');
      console.log('Token in fetchCompanies:', token);
      if (!token) {
        toast.error('No token found, please log in again', {
          description: 'Redirecting to login...',
          duration: 3000,
        });
        navigate('/admin/login');
        return;
      }
      await withMinimumLoading(async () => {
        const response = await api.get('/companies');
        setCompanies(response.data);
      });
    };

    fetchCompanies().catch((error) => {
      if (error.response?.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again',
          duration: 3000,
        });
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        toast('Failed to fetch companies', {
          description: error.message || 'Unknown error',
          duration: 3000,
        });
      }
    });
  }, [dispatch, navigate]);

  const handleEditClick = (company) => {
    setEditingCompany({ ...company });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCompany) {
      setEditingCompany((prev) => ({
        ...prev,
        [name]: name === 'employees' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleNewCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({
      ...prev,
      [name]: name === 'employees' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingCompany) return;
    await withMinimumLoading(async () => {
      const response = await api.put(`/companies/${editingCompany._id}`, editingCompany);
      setCompanies(companies.map((company) =>
        company._id === response.data._id ? response.data : company
      ));
      toast.success('Company updated', {
        description: `${editingCompany.name} has been updated successfully`,
        duration: 3000,
      });
      setEditingCompany(null);
    });
  };

  const handleDelete = async (id) => {
    await withMinimumLoading(async () => {
      await api.delete(`/companies/${id}`);
      setCompanies(companies.filter((company) => company._id !== id));
      toast.success('Company deleted', {
        description: 'The company has been deleted successfully',
        duration: 3000,
      });
    });
  };

  const handleAddCompany = async () => {
    await withMinimumLoading(async () => {
      const response = await api.post('/companies', newCompany);
      setCompanies([...companies, response.data]);
      setNewCompany({
        name: '',
        industry: '',
        location: '',
        employees: 0,
        website: '',
        status: 'Active',
      });
      setIsAddDialogOpen(false);
      toast.success('Company added', {
        description: `${newCompany.name} has been added successfully`,
        duration: 3000,
      });
    });
  };

  // Skeleton Loader Component for Companies
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
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
            <h1 className="text-2xl font-bold">Companies Management</h1>
            <p className="text-gray-500">Manage all companies in the system</p>
          </div>
          <Button
            className="bg-[#249885] hover:bg-[#1b7465]"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Company
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card key={company._id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{company.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Employees</p>
                        <p>{company.employees}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Website</p>
                        <p className="truncate">{company.website}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          company.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {company.status}
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(company)}
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(company._id)}
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

        <Dialog open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>
                Make changes to the company information here.
              </DialogDescription>
            </DialogHeader>
            {editingCompany && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingCompany.name}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={editingCompany.industry}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={editingCompany.location}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    name="employees"
                    type="number"
                    value={editingCompany.employees}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={editingCompany.website}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    value={editingCompany.status}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCompany(null)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Enter the details for the new company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-name">Company Name</Label>
                <Input
                  id="new-name"
                  name="name"
                  value={newCompany.name}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-industry">Industry</Label>
                <Input
                  id="new-industry"
                  name="industry"
                  value={newCompany.industry}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-location">Location</Label>
                <Input
                  id="new-location"
                  name="location"
                  value={newCompany.location}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-employees">Number of Employees</Label>
                <Input
                  id="new-employees"
                  name="employees"
                  type="number"
                  value={newCompany.employees}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-website">Website</Label>
                <Input
                  id="new-website"
                  name="website"
                  value={newCompany.website}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-status">Status</Label>
                <Input
                  id="new-status"
                  name="status"
                  value={newCompany.status}
                  onChange={handleNewCompanyInputChange}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAddCompany} disabled={loading}>
                {loading ? 'Adding...' : 'Add Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CompaniesPage;
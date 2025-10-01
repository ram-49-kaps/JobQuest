import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, X } from 'lucide-react';
import { toast } from 'sonner';
import api from './Api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/authSlice';

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionType, setActionType] = useState(null);

  const dispatch = useDispatch();
  const appState = useSelector((state) => state.auth);
  const loading = appState?.loading ?? false;
  const logo = appState?.logo;

  // Helper function to ensure minimum loading time
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
    const fetchCandidates = async () => {
      await withMinimumLoading(async () => {
        const response = await api.get('/candidates');
        setCandidates(response.data);
      }).catch((error) => {
        console.error('Fetch candidates error:', error);
        toast.error('Failed to fetch candidates', {
          description: error.response?.data?.message || 'Please check your connection',
        });
      });
    };
    fetchCandidates();
  }, [dispatch]);

  const handleOpenModal = (candidate, type) => {
    setSelectedCandidate(candidate);
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedCandidate) return;

    await withMinimumLoading(async () => {
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      const response = await api.put(`/candidates/${selectedCandidate._id}`, {
        status: newStatus,
      });

      setCandidates(candidates.map((candidate) =>
        candidate._id === selectedCandidate._id ? response.data : candidate
      ));

      toast.success(`Candidate ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
    }).catch((error) => {
      toast.error(`Failed to ${actionType} candidate`, {
        description: error.response?.data?.message || 'Something went wrong',
      });
    });

    setShowModal(false);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Skeleton Loader Component for Candidates
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex items-end space-x-2">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
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
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-gray-500">Review and manage job applications</p>
        </div>
        {loading ? (
          <div className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : candidates.length === 0 ? (
          <p>No candidates found.</p>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{candidate.name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${candidate.status === 'Reviewing' ? 'bg-yellow-100 text-yellow-700'
                          : candidate.status === 'Approved' ? 'bg-green-100 text-[#249885]'
                          : 'bg-red-100 text-red-700'}`}
                    >
                      {candidate.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Applied Position</p>
                      <p className="font-medium">{candidate.role}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Applied Date</p>
                      <p className="font-medium">{formatDate(candidate.appliedDate)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{candidate.email}</p>
                    </div>
                    {candidate.status === 'Reviewing' && (
                      <div className="flex items-end space-x-2">
                        <Button
                          variant="outline"
                          className="border-[#249885] text-[#249885] hover:bg-[#d1f6f0]"
                          onClick={() => handleOpenModal(candidate, 'approve')}
                          disabled={loading}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleOpenModal(candidate, 'reject')}
                          disabled={loading}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {actionType === 'approve' ? 'Approve Candidate' : 'Reject Candidate'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-gray-600">
                Are you sure you want to {actionType === 'approve' ? 'approve' : 'reject'}{' '}
                <strong>{selectedCandidate?.name}</strong>?
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className={actionType === 'approve' ? 'bg-[#249885] text-white' : 'bg-red-500 text-white'}
                  onClick={handleConfirmAction}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CandidatesPage;
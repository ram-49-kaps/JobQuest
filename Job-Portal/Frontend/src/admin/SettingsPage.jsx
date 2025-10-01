import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { setLoading } from '../redux/authSlice';

function SettingsPage() {
  const dispatch = useDispatch();
  const { loading, logo } = useSelector((state) => state.auth);

  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helper function for minimum loading duration
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

  const handleSaveSettings = async () => {
    await withMinimumLoading(async () => {
      // Simulate an async operation (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    });
  };

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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your admin panel preferences</p>
        </div>

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications for new applications
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={loading}
                  />
                  <span className="text-sm">
                    {emailNotifications ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 relative">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button
                className="w-full bg-[#249885] hover:bg-[#1a6f61]"
                onClick={handleSaveSettings}
                disabled={loading || (!company && !email && !currentPassword && !newPassword)}
              >
                {loading ? 'Updating...' : 'Update Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
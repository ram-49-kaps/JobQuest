import React, { useState } from 'react'
import { Navigate , useNavigate , Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { Menu, LogOut} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {Toaster as sooner} from "../components/ui/sonner"

function AdminLayout() {
    const [isSidebarOpen , setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const isAuthenticated = localStorage.getItem('isAdminLoggedIn')

    const handleLogout = () => {
      localStorage.removeItem('isAdminLoggedIn');
      toast.success("Logged out successfully");
    
      navigate('/admin/login')
    };

    if(!isAuthenticated){
      return <Navigate to="/admin/login" replace />
    };
  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

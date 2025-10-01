import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard,Briefcase, Users, Settings , Building } from 'lucide-react'
import Logo from '@/components/Shared/Logo';
function AdminSidebar({isOpen}) {
  const menuItems = [
    {icon: LayoutDashboard, label:'Dashboard', path:'/admin/dashboard'},
    {icon: Briefcase, label:'Jobs', path:'/admin/jobs'},
    {icon: Building, label: 'Companies', path: '/admin/companies'},
    {icon: Users, label:'Candidates', path:'/admin/candidates'},
    {icon: Settings, label:'Settings', path:'/admin/settings'},
  ];
  return (
    <div
     className={`sidebar border-r transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
     }`}
     >
      <div className='p-4 border-b'>
      <h1 className={`font-bold text-[#249885] ${!isOpen && 'hidden'}`}> 
        <Logo />
      </h1>
      
      </div>
     <nav className='p-2'>
      {menuItems.map((item) => (
        <NavLink
        key={item.path}
        to={item.path}
        className={({isActive}) =>
          `flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
            isActive 
            ? 'bg-[#249885] text-white'
            : 'text-gray-500 hover:bg-[#d0e7e3]'
          }`
        }
        >
          <item.icon className='w-5 h-5'/>
          {isOpen && <span>{item.label}</span>}
        </NavLink>
      ))}
     </nav>
    </div>
  )
}

export default AdminSidebar

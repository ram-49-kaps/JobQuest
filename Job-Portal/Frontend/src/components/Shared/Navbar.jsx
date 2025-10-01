import React, { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Bookmark, LogOut, User2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser, setUser } from '../../redux/authSlice';
import api from '../../api';

const Navbar = () => {
  const { token, role, user, fullName } = useSelector((store) => store.auth);
  const profileImage = role === 'Job Seeker' ? user?.profilePicture : user?.company?.logo;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const response = await api.get('/auth/profile');
        if (response.data) {
          const userData = response.data.user || response.data;
          dispatch(setUser({ 
            token, 
            role: userData.role, 
            user: userData,
            fullName: userData.fullName 
          }));
        }
      } catch (error) {
        console.error('Error fetching user in Navbar:', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUser();
  }, [token, dispatch]);
  
  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('token');
    localStorage.removeItem('justLoggedIn');
    navigate('/');
  };

  const handleEditResume = () => {
    // Redirect to the resume builder page
    navigate('/resume-builder');
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-[#249885] to-[#1a1a1a] text-white py-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center group">
          <Link to="/">
            <Logo className="mr-5 h-8 w-8 transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          </Link>
        </div>
        <ul className="hidden md:flex space-x-6 justify-center items-center">
          <li className="relative text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-300 ease-in-out group text-center">
            <Link to="/">Home</Link>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#249885] transition-all duration-300 ease-in-out group-hover:w-full"></span>
          </li>
          {role === 'Recruiter' ? (
            <li className="relative text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-300 ease-in-out group text-center">
              <Link to="/recruiter-dashboard">Dashboard</Link>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#249885] transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </li>
          ) : (
            <li className="relative text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-300 ease-in-out group text-center">
              <Link to="/jobs">Jobs</Link>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#249885] transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </li>
          )}
          <li className="relative text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-300 ease-in-out group text-center">
            <Link to="/aboutus">About Us</Link>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#249885] transition-all duration-300 ease-in-out group-hover:w-full"></span>
          </li>
          <li className="relative text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-300 ease-in-out group text-center">
            <Link to="/contactus">Contact Us</Link>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#249885] transition-all duration-300 ease-in-out group-hover:w-full"></span>
          </li>
        </ul>
        <div className="flex space-x-4 items-center">
          {!token ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="relative transition-all duration-300">
                  <span className="relative z-10">Login</span>
                  <span className="absolute inset-0 bg-[#249885] opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#249885] hover:bg-[#18685b] font-semibold px-6 py-2 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <span className="relative">Sign Up</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></span>
                </Button>
              </Link>
            </>
          ) : (
            <Popover>
              <PopoverTrigger>
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#249885] transition-colors duration-300">
                  <Avatar className="transform transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-[#249885] hover:shadow-lg">
                    <AvatarImage 
                      src={profileImage ? `http://localhost:5002${profileImage}` : '/uploads/profiles/default-profile.jpg'}
                      alt="profile"
                      onError={(e) => {
                        e.target.src = "https://cdn-icons-png.flaticon.com/128/9408/9408175.png";
                      }}
                    />
                    <AvatarFallback className="bg-[#249885] text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{fullName || user?.fullName || 'User'}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Link to="/profile">
                  <Button variant="ghost" className="w-full justify-start gap-2 mb-1">
                    <User2 className="h-4 w-4" />
                    Your Profile
                  </Button>
                </Link>
                <Link to="/saved-jobs">
                  <Button variant="ghost" className="w-full justify-start gap-2 mb-1">
                    <Bookmark className="h-4 w-4" />
                    Saved Jobs
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
  
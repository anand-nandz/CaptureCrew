import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { ADMIN } from "../../config/constants/constants";
import { logout } from "../../redux/slices/AdminSlice";
import { useDispatch } from "react-redux";
import { Typography } from "@material-tailwind/react";
import { axiosInstanceAdmin } from "../../config/api/axiosInstance";
import { showToastMessage } from "../../validations/common/toast";
import { Outlet } from 'react-router-dom';
// interface LayoutProps {
//   children: React.ReactNode;
// }

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const path = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async(e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await axiosInstanceAdmin.get('/logout'); 
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRefresh')
      dispatch(logout());
      navigate(`/admin${ADMIN.LOGIN}`);
      showToastMessage('Logged out successfully', 'success');
    } catch (error) {
      console.log('Logout Error', error);
      showToastMessage('Error during logout', 'error');
    }
    
  };
 

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed bg-white text-black w-64 h-full transition-transform border-r border-gray-300 z-50 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"} 
        sm:translate-x-0 
        lg:w-64 md:w-56 sm:w-48`}
      >
        <div className="p-4">
          <nav>
            <Typography
              variant="h4"
              placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
              className="font-bold text-2xl lg:text-2xl md:text-xl sm:text-lg"
            >
              Capture Crew
            </Typography>
            <ul className="mt-8 space-y-2">
              <Link to={'/admin'+ADMIN.DASHBOARD}>
                <li
                  className={`${
                    path.pathname === '/admin'+ADMIN.DASHBOARD
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <svg
                    className="w-5 h-5 mr-3 lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-3 sm:h-3"
                    viewBox="0 0 18 18"
                    fill="currentColor"
                  >
                    <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z" />
                  </svg>
                  Dashboard
                </li>
              </Link>
              <Link to={'/admin'+ADMIN.USERS}>
                <li
                  className={`${
                    path.pathname ===  '/admin'+ADMIN.USERS
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <i className="fa-solid fa-users mr-3"></i>
                  Users
                </li>
              </Link>

              <Link to={'/admin'+ADMIN.VENDORS}>
                <li
                  className={`${
                    path.pathname ===  '/admin'+ADMIN.VENDORS
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <i className="fa-solid fa-users mr-3"></i>
                  Vendors
                </li>
              </Link>

              <Link to={'/admin'+ADMIN.DASHBOARD}>
                <li
                  className={`${
                    path.pathname ===  ADMIN.VENDORS
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <i className="fa-solid fa-users mr-3"></i>
                  Transactions
                </li>
              </Link>

              <Link to={'/admin'+ADMIN.DASHBOARD}>
                <li
                  className={`${
                    path.pathname ===  ADMIN.VENDORS
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <i className="fa-solid fa-users mr-3"></i>
                  Posts
                </li>
              </Link>

              <Link to={'/admin'+ADMIN.DASHBOARD}>
                <li
                  className={`${
                    path.pathname ===  ADMIN.VENDORS
                      ? "bg-gray-300 text-gray-800"
                      : "text-gray-900"
                  } flex rounded-md p-2 cursor-pointer hover:bg-gray-200 transition-colors
                  text-base lg:text-base md:text-sm sm:text-xs`}
                >
                  <i className="fa-solid fa-users mr-3"></i>
                  Bookings
                </li>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full mt-4 bg-slate-900 text-white rounded-md p-2 cursor-pointer hover:bg-slate-800 transition-colors
                text-base lg:text-base md:text-sm sm:text-xs"
              >
                Logout
              </button>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:ml-48 md:ml-56 lg:ml-64">
        {/* Navbar */}
        <header className="fixed w-full bg-black h-16 text-white p-4 flex justify-between lg:hidden md:hidden items-center z-40">
          <Typography
            variant="h5"
            placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
            className="font-bold text-xl lg:text-xl md:text-lg sm:text-base"
          >
            CaptureCrew
          </Typography>
          <button onClick={toggleSidebar} className="sm:hidden">
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto mt-16 p-4 bg-white">
          {/* {children} */}
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default Layout;
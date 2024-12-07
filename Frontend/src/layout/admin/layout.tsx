import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, List, ListItem, ListItemPrefix, IconButton, Tooltip } from "@material-tailwind/react";
import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  FileTextIcon, 
  LogOutIcon,
} from "lucide-react";
import { ADMIN } from "../../config/constants/constants";
import { logout } from "../../redux/slices/AdminSlice";
import { useDispatch } from "react-redux";
import { axiosInstanceAdmin } from "../../config/api/axiosInstance";
import { showToastMessage } from "../../validations/common/toast";
import { Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon,FlagIcon } from "@heroicons/react/24/solid";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems: MenuItem[] = useMemo(() => [
    { icon: LayoutDashboardIcon, label: 'Dashboard', path: `/admin${ADMIN.DASHBOARD}` },
    { icon: UsersIcon, label: 'Users', path: `/admin${ADMIN.USERS}` },
    { icon: UsersIcon, label: 'Vendors', path: `/admin${ADMIN.VENDORS}` },
    { icon: FileTextIcon, label: 'Posts', path: '/admin/view-all-posts' },
    { icon: ShoppingBagIcon, label: 'Bookings', path: `/admin${ADMIN.ALLBOOKINGS}` },
    { icon: FlagIcon, label: 'Reports', path: `/admin${ADMIN.REPORT}` },
    { icon: LogOutIcon, label: 'Log Out', path: null }
  ], []);

  // Determine active item based on current location
  const activeItem = useMemo(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => 
      item.path && currentPath.includes(item.path)
    );
    return activeMenuItem ? activeMenuItem.label : 'Dashboard';
  }, [location.pathname, menuItems]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = async (item: MenuItem) => {
    if (item.label === 'Log Out') {
      try {
        await axiosInstanceAdmin.get('/logout'); 
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefresh');
        dispatch(logout());
        navigate(`/admin${ADMIN.LOGIN}`);
        showToastMessage('Logged out successfully', 'success');
      } catch (error) {
        console.error('Logout Error', error);
        showToastMessage('Error during logout', 'error');
      }
      return;
    }
    
    // Navigate to the selected item's path
    if (item.path) {
      navigate(item.path);
    }
    
    // Close sidebar on mobile after navigation
    if (isMobile) setIsCollapsed(true);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex">
      <Card
        className={`min-h-screen ${isCollapsed ? 'w-20' : 'w-64'} p-4 shadow-xl shadow-blue-gray-900/5 transition-all duration-300 fixed left-0 top-0 h-full`}
        onPointerEnterCapture={undefined} 
        onPointerLeaveCapture={undefined} 
        placeholder={undefined}
      >
        <div className="mb-2 flex items-center justify-between p-4">
          {!isCollapsed && (
            <Link to={`/admin${ADMIN.DASHBOARD}`}>
              <Typography 
                variant="h5" 
                color="blue-gray"
                onPointerEnterCapture={undefined} 
                onPointerLeaveCapture={undefined} 
                placeholder={undefined}
              >
                Capture Crew
              </Typography>
            </Link>
          )}
          <IconButton 
            variant="text" 
            size="sm" 
            onClick={toggleSidebar}
            onPointerEnterCapture={undefined} 
            onPointerLeaveCapture={undefined} 
            placeholder={undefined}
          >
            {isCollapsed ? <Bars3Icon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          </IconButton>
        </div>
        <List
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined} 
          placeholder={undefined}
        >
          {menuItems.map((item) => (
            isCollapsed ? (
              <Tooltip
                key={item.label}
                content={item.label}
                placement="right"
                className="bg-white px-4 py-3 text-black shadow-xl shadow-black/10"
              >
                <ListItem
                  className={`${activeItem === item.label ? 'bg-blue-50' : ''} justify-center hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
                  onClick={() => handleMenuClick(item)}
                  onPointerEnterCapture={undefined} 
                  onPointerLeaveCapture={undefined} 
                  placeholder={undefined}
                >
                  <ListItemPrefix
                    onPointerEnterCapture={undefined} 
                    onPointerLeaveCapture={undefined} 
                    placeholder={undefined}
                  >
                    <item.icon className="h-5 w-5 mr-0" />
                  </ListItemPrefix>
                </ListItem>
              </Tooltip>
            ) : (
              <ListItem
                key={item.label}
                className={`${activeItem === item.label ? 'bg-blue-50' : ''} hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
                onClick={() => handleMenuClick(item)}
                onPointerEnterCapture={undefined} 
                onPointerLeaveCapture={undefined} 
                placeholder={undefined}
              >
                <ListItemPrefix
                  onPointerEnterCapture={undefined} 
                  onPointerLeaveCapture={undefined} 
                  placeholder={undefined}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                </ListItemPrefix>
                {item.label}
              </ListItem>
            )
          ))}
        </List>
      </Card>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} p-4`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
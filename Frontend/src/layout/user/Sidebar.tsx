import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, List, ListItem, ListItemPrefix, ListItemSuffix, Chip, IconButton, Tooltip } from "@material-tailwind/react";
import {
  UserCircleIcon, ShoppingBagIcon,
  ChatBubbleLeftRightIcon, PowerIcon,
  Bars3Icon, XMarkIcon, UserGroupIcon
} from "@heroicons/react/24/solid";
import { USER } from '../../config/constants/constants';
import { axiosInstance } from '../../config/api/axiosInstance';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/UserSlice';
import { showToastMessage } from '../../validations/common/toast';
import { Wallet } from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  badge: string | null;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Profile');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const menuItems = useMemo(() => [
    { icon: UserCircleIcon, label: 'Profile', path: USER.PROFILE, badge: null },
    { icon: Wallet, label: 'Wallet', path: USER.WALLET, badge: null },
    { icon: ShoppingBagIcon, label: 'Bookings', path: USER.BOOKING, badge: null },
    { icon: ChatBubbleLeftRightIcon, label: 'Chats', path: USER.CHAT, badge: null },
    { icon: UserGroupIcon, label: 'Vendors', path: USER.VENDORLIST, badge: null },
    { icon: PowerIcon, label: 'Log Out', path: null, badge: null }
  ], []); 

  const handleMenuClick = async (item: MenuItem) => {
    if (item.label === 'Log Out') {
      try {
        await axiosInstance.post('/logout');
        localStorage.removeItem('userToken');
        dispatch(logout());
        navigate(USER.LOGIN);
        showToastMessage('Logged out successfully', 'success');
      } catch (error) {
        console.error('Logout Error', error);
        showToastMessage('Error during logout', 'error');
      }
      return;
    }
    setActiveItem(item.label);
    navigate(item.path!);
    if (isMobile) setIsCollapsed(true);
  };
  
  useEffect(() => {
    const currentPath = location.pathname;
    const active = menuItems.find((item) => currentPath.includes(item.path || ''))?.label || 'Profile';
    setActiveItem(active);
  }, [location.pathname, menuItems]);


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card
      className={`min-h-screen ${isCollapsed ? 'w-20' : 'w-64'} p-4 shadow-xl shadow-blue-gray-900/5 transition-all duration-300`}
      onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
    >
      <div className="mb-2 flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link to={`${USER.HOME}`}>
            <Typography variant="h5" color="blue-gray"
              onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
              Capture Crew
            </Typography>
          </Link>
        )}
        <IconButton variant="text" size="sm" onClick={toggleSidebar}
          onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
          {isCollapsed ? <Bars3Icon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
        </IconButton>
      </div>
      <List
        onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
        {menuItems.map((item) => (
          isCollapsed ? (
            <Tooltip
              key={item.label}
              content={item.label}
              placement="top"
              className="bg-white px-4 py-3 text-black shadow-xl shadow-black/10"
            >
              <ListItem
                className={`${activeItem === item.label ? 'bg-blue-50' : ''} justify-center hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
                onClick={() => handleMenuClick(item)}
                onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
              >
                <ListItemPrefix
                  onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                  <item.icon className="h-5 w-5 mr-0" />
                </ListItemPrefix>
              </ListItem>
            </Tooltip>
          ) : (
            <ListItem
              key={item.label}
              className={`${activeItem === item.label ? 'bg-blue-50' : ''} hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
              onClick={() => handleMenuClick(item)}
              onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
            >
              <ListItemPrefix
                onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
              </ListItemPrefix>
              {item.label}
              {item.badge && (
                <ListItemSuffix
                  onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                  <Chip value={item.badge} size="sm" className="rounded-full bg-black text-white" />
                </ListItemSuffix>
              )}
            </ListItem>
          )
        ))}
      </List>
    </Card>
  );
};

export default Sidebar;

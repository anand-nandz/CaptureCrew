import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, List, ListItem, ListItemPrefix, ListItemSuffix, Chip } from "@material-tailwind/react";
import {
  UserCircleIcon, MapPinIcon, ShoppingBagIcon,
  ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon, PowerIcon
} from "@heroicons/react/24/solid";
import { USER } from '../../config/constants/constants';
import { axiosInstance } from '../../config/api/axiosInstance';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/UserSlice';
import { showToastMessage } from '../../validations/common/toast';

interface MenuItem {
  icon: React.ElementType; 
  label: string;
  path: string | null;
  badge: string | null;
}


const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Profile');
  const dispatch = useDispatch()
  const menuItems : MenuItem[] = [
    {
      icon: UserCircleIcon,
      label: 'Profile',
      path: USER.PROFILE,
      badge: null
    },
    {
      icon: MapPinIcon,
      label: 'Manage Address',
      path: USER.HOME,
      badge: null
    },
    {
      icon: ShoppingBagIcon,
      label: 'Bookings',
      path: USER.PROFILE,
      badge: '3'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Chats',
      path: USER.PROFILE,
      badge: '5'
    },
    {
      icon: ClockIcon,
      label: 'History',
      path: USER.PROFILE,
      badge: null
    },
    {
      icon: Cog6ToothIcon,
      label: 'Settings',
      path: USER.PROFILE,
      badge: null
    },
    {
      icon: PowerIcon,
      label: 'Log Out',
      path: null,
      badge: null
    }
  ];

  const handleMenuClick = async (item : MenuItem) => {
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
  };

  return (
    <Card className="h-full w-64 p-4 shadow-xl shadow-blue-gray-900/5" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} >
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Dashboard
        </Typography>
      </div>
      <List placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        {menuItems.map((item) => (
          <ListItem
            key={item.label}
            placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
            className={activeItem === item.label ? 'bg-blue-50' : ''}
            onClick={() => handleMenuClick(item)}
          >
            <ListItemPrefix placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              <item.icon className="h-5 w-5" />
            </ListItemPrefix>
            {item.label}
            {item.badge && (
              <ListItemSuffix placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                <Chip value={item.badge} size="sm" color="blue" className="rounded-full" />
              </ListItemSuffix>
            )}
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default Sidebar;
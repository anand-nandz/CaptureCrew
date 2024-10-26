import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, List, ListItem, ListItemPrefix, ListItemSuffix, Chip } from "@material-tailwind/react";
import {
    UserCircleIcon, MapPinIcon, ShoppingBagIcon,
    ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon, PowerIcon
} from "@heroicons/react/24/solid";
import { VENDOR } from '../../config/constants/constants';
import { useDispatch } from 'react-redux';
import { showToastMessage } from '../../validations/common/toast';
import { axiosInstanceVendor } from '../../config/api/axiosInstance';
import { logout } from '../../redux/slices/VendorSlice';

interface MenuItem {
    icon: React.ElementType; 
    label: string;
    path: string | null;
    badge: string | null;
}


const SidebarVendor = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('Profile');
    const dispatch = useDispatch()
    const menuItems : MenuItem[] = [
        {
            icon: UserCircleIcon,
            label: 'Profile',
            path: VENDOR.PROFILE,
            badge: null
        },
        {
            icon: MapPinIcon,
            label: 'Company Details',
            path: VENDOR.DASHBOARD,
            badge: null
        },
        {
            icon: ShoppingBagIcon,
            label: 'Bookings',
            path: VENDOR.PROFILE,
            badge: '3'
        },
        {
            icon: ChatBubbleLeftRightIcon,
            label: 'Chats',
            path: VENDOR.PROFILE,
            badge: '5'
        },
        {
            icon: ClockIcon,
            label: 'Uploaded Contents',
            path: VENDOR.PROFILE,
            badge: null
        },
        {
            icon: Cog6ToothIcon,
            label: 'Slot Update',
            path: VENDOR.PROFILE,
            badge: null
        },
        {
            icon: Cog6ToothIcon,
            label: 'Reviews',
            path: VENDOR.PROFILE,
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
                await axiosInstanceVendor.post('/logout');
                localStorage.removeItem('vendorToken');
                dispatch(logout());
                navigate(VENDOR.LOGIN);
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

export default SidebarVendor;
import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  
} from "@nextui-org/react";
import { ChevronDown, Scale, Activity, Slash, Server, User, Search, MessageCircle, Camera } from 'lucide-react';
import { axiosInstance } from '../../config/api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/UserSlice';
import { Link, useNavigate } from 'react-router-dom';
import { USER } from '../../config/constants/constants';
import { showToastMessage } from '../../validations/common/toast';
import UserRootState from '@/redux/rootstate/UserState';


export default function UserNavbar() {
  const user= useSelector((state:UserRootState)=>state.user.userData);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleLogout = async (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post('/logout');
      localStorage.removeItem('userToken')
      dispatch(logout());
      navigate(`${USER.LOGIN}`);
      showToastMessage('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout Error', error);
      showToastMessage('Error during logout', 'error');
    }  finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      navigate(`${USER.PROFILE}`)
    } catch (error) {
      console.error('Profile Error', error);
      showToastMessage('Error during loading profile', 'error');
    }
  }
  
  const icons = {
    chevron: <ChevronDown size={16} />,
    scale: <Scale className="text-warning" size={30} />,
    activity: <Activity className="text-secondary" size={30} />,
    slash: <Slash className="text-primary" size={30} />,
    server: <Server className="text-success" size={30} />,
    user: <User className="text-red-800" size={30} />,
    search: <Search size={18} />,
    message: <MessageCircle className="text-warning" size={24} />
  };

  const menuItems = [
    { label: "HOME", route: `${USER.HOME}` },
    { label: "POST", route: `${USER.POST}` },
    { label: "VENDORS", route: `${USER.VENDORLIST}` },
    { label: "BOOKINGS", route: `${USER.BOOKING}` },
    { label: "ABOUT US", route: `${USER.ABOUT_US}` }
  ];
  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-stone-900 font-['judson'] py-2 w-full"
      maxWidth="full"
    >
      <NavbarContent className="sm:hidden">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-white"
        />
      </NavbarContent>
      <NavbarBrand>
      <Camera className="h-6 w-6 text-red-500" />
        <p className="font-bold text-white pl-2 text-xl lg:text-2xl">CaptureCrew</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link to={`${USER.HOME}`} className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base">
            HOME
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to={`${USER.POST}`} className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" >
            POST
          </Link>
        </NavbarItem>
       
        <NavbarItem>
          <Link to={`${USER.VENDORLIST}`} className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" >
            VENDORS
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to={`${USER.BOOKING}`} className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" >
            BOOKINGS
          </Link>

        </NavbarItem>
        <NavbarItem>
          <Link to={`${USER.ABOUT_US}`} className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" >
            ABOUT US
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              size="sm"
              src={ user?.imageUrl || "/images/user.png"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" startContent={<User size={20} />} onClick={handleProfileClick}>
              Profile
            </DropdownItem>
            <DropdownItem key="logout" className="text-danger" color="danger" startContent={<Slash size={20} />}
              onClick={handleLogout}>
              {isLoading ? "Logging out..." : "Log Out"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <NavbarItem className="hidden sm:flex">
          <Link to={`${USER.CHAT}`} className="text-white">
            {icons.message}
          </Link>
        </NavbarItem>
      </NavbarContent>

      
      <NavbarMenu className="bg-stone-800 pt-6 px-6">
        <NavbarMenuItem>
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              className="w-full text-white hover:text-gray-300"
              to={item.route}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

      <style>{`
        @media (max-width: 1024px) and (min-width: 880px) {
          .navbar-content {
            font-size: 0.9rem;
          }
        }
        @media (max-width: 879px) and (min-width: 746px) {
          .navbar-content {
            font-size: 0.2rem;
          }
        }
          @media (max-width: 745px) and (min-width: 643px) {
          .navbar-content {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </Navbar>
  );
}
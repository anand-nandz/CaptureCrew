import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Input
} from "@nextui-org/react";
import { ChevronDown, Scale, Activity, Slash, Server, User, Search, MessageCircle } from 'lucide-react';
import { axiosInstance } from '../../config/api/axiosInstance';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/UserSlice';
import { useNavigate } from 'react-router-dom';
import { USER } from '../../config/constants/constants';
import { showToastMessage } from '../../validations/common/toast';


export default function UserNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/logout'); 
      localStorage.removeItem('userToken')
      // localStorage.removeItem('userRefresh')
      dispatch(logout());
      navigate(`${USER.LOGIN}`); 
      showToastMessage('Logged out successfully', 'success');
    } catch (error) {
      console.log('Logout Error', error);
      showToastMessage('Error during logout', 'error');
    }
  };

  const handleProfileClick =async(e: React.MouseEvent<HTMLLIElement>)=>{
    e.preventDefault();
    try {
      navigate(`${USER.PROFILE}`)
    } catch (error) {
      console.log('Profile Error', error);
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

  const menuItems = ["HOME", "BROWSE SERVICES", "FAVORITES", "ABOUT US"];

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-stone-900 font-['judson'] py-2 w-full"
      maxWidth="full"
    >
      {/* Logo and Menu Toggle */}
      <NavbarContent className="sm:hidden">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-white"
        />
      </NavbarContent>
      <NavbarBrand>
        <p className="font-bold text-white pl-4 text-xl lg:text-2xl">CaptureCrew</p>
      </NavbarBrand>

      {/* Navbar Items */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" href="#">
            HOME
          </Link>
        </NavbarItem>
        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base"
                endContent={icons.chevron}
                radius="sm"
                variant="light"
              >
                BROWSE SERVICES
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Services"
            className="w-[340px]"
            itemClasses={{ base: "gap-4" }}
          >
            <DropdownItem key="autoscaling" description="Scale apps based on load." startContent={icons.scale}>
              Autoscaling
            </DropdownItem>
            <DropdownItem key="usage_metrics" description="Real-time metrics." startContent={icons.activity}>
              Usage Metrics
            </DropdownItem>
            <DropdownItem key="production_ready" description="High availability." startContent={icons.slash}>
              Production Ready
            </DropdownItem>
            <DropdownItem key="99_uptime" description="+99% uptime." startContent={icons.server}>
              +99% Uptime
            </DropdownItem>
            <DropdownItem key="support" description="Supreme support team." startContent={icons.user}>
              Supreme Support
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <NavbarItem className="max-w-xs hidden md:flex">
          <Input
            classNames={{
              
              base: "max-w-full lg:text-xl md:text-lg sm:text-base",
              input: "text-small lg:text-xl md:text-lg sm:text-base",
              inputWrapper: "font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Type to search..."
            size="sm"
            startContent={icons.search}
            type="search"
          />
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" href="#">
            FAVORITES
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white hover:text-gray-300 lg:text-xl md:text-lg sm:text-base" href="#">
            ABOUT US
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Avatar and Chat Icon */}
      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" startContent={<User size={20}/>} onClick={handleProfileClick}>
              Profile 
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Scale size={20} />}>
              Settings
            </DropdownItem>
            <DropdownItem key="logout" className="text-danger" color="danger" startContent={<Slash size={20} />}
              onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <NavbarItem className="hidden sm:flex">
          <Link href="#" className="text-white">
            {icons.message}
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-gray-800 pt-6 px-6">
        <NavbarMenuItem>
          <Input
            classNames={{
              base: "max-w-full",
              input: "text-small",
              inputWrapper: "font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Type to search..."
            size="sm"
            startContent={icons.search}
            type="search"
          />
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full text-white hover:text-gray-300"
              href="#"
              size="lg"
            >
              {item}
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
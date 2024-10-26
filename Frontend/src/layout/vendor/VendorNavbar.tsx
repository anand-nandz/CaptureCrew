import { useState, useEffect } from 'react';
import { Navbar, MobileNav, Typography, IconButton } from "@material-tailwind/react";
import { MessageCircle, User, Scale, Slash } from 'lucide-react';
import { VENDOR } from '../../config/constants/constants';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { axiosInstanceVendor } from '../../config/api/axiosInstance';
import { logout } from "../../redux/slices/VendorSlice";
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { showToastMessage } from '../../validations/common/toast';

export default function VendorNavbar() {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 768 && setOpenNav(false),
    );
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileClick =async(e: React.MouseEvent<HTMLElement> )=>{
    e.preventDefault();
    try {
      navigate(`${VENDOR.PROFILE}`)
    } catch (error) {
      console.log('Profile Error', error);
      showToastMessage('Error during loading profile', 'error');
    }
   
  }

  const handleLogout = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    axiosInstanceVendor
      .post("/logout")
      .then(() => {
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendorRefresh')
        dispatch(logout()); 
        navigate(`${VENDOR.LOGIN}`);
      })
      .catch((error) => {
        console.log("here", error);
      });
  };

  return (
   <>
     <Navbar className="bg-black w-full px-4 md:px-8 lg:px-16 rounded-none border border-none" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
      <div className="flex items-center justify-between">
        {/* Logo and CaptureCrew */}
        <div className="flex items-center gap-4">
          <Typography as="a" href="#" className="text-white text-2xl font-bold" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            <img src="/images/cclogo.svg" alt="Logo" className="h-8" />
          </Typography>

          <Typography as="a" href="#" className="text-white text-lg md:text-xl lg:text-2xl font-semibold" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            CaptureCrew
          </Typography>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-6 md:gap-8 lg:gap-10 items-center text-white">
          <Typography as="a" href={VENDOR.DASHBOARD} className="cursor-pointer text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            HOME
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined} onClick={handleProfileClick}
              onPointerLeaveCapture={undefined}>
            PROFILE
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            CONTENTS
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            REVIEWS
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            REQUEST QUOTES
          </Typography>
        </div>

        {/* Avatar, Chat Icon, and Mobile Menu Icon */}
        <div className="flex items-center gap-4">
          {/* Avatar Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Vendor Name"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="profile" startContent={<User size={20} />} onClick={handleProfileClick}>
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

          {/* Chat Icon */}
          <MessageCircle className="text-white w-6 h-6 cursor-pointer" />

          {/* Mobile Menu Icon */}
          <IconButton
            variant="text"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            className="text-white sm:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav open={openNav}>
        <div className="flex flex-col gap-4 items-center text-white">
          <Typography as="a" href="/vendor/dashboard" className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            HOME
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            PROFILE
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            CONTENTS
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            REVIEWS
          </Typography>
          <Typography as="a" href="#" className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
            REQUEST QUOTES
          </Typography>
        </div>
      </MobileNav>
    </Navbar>

    
   </>
  );
}
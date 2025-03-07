import { useState, useEffect } from 'react';
import { Navbar, MobileNav, Typography, IconButton } from "@material-tailwind/react";
import { MessageCircle, User, Slash, Camera } from 'lucide-react';
import { VENDOR } from '../../config/constants/constants';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstanceVendor } from '../../config/api/axiosInstance';
import { logout } from "../../redux/slices/VendorSlice";
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { showToastMessage } from '../../validations/common/toast';
import VendorRootState from '@/redux/rootstate/VendorState';

export default function VendorNavbar() {
  const [openNav, setOpenNav] = useState(false);
  const vendor = useSelector((state:VendorRootState)=>state.vendor.vendorData)

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 768 && setOpenNav(false),
    );
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      navigate(`${VENDOR.PROFILE}`)
    } catch (error) {
      console.error('Profile Error', error);
      showToastMessage('Error during loading profile', 'error');
    }

  }

  const handleLogout = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    axiosInstanceVendor
      .post("/logout")
      .then(() => {
        localStorage.removeItem('vendorToken')
        dispatch(logout());
        navigate(`${VENDOR.LOGIN}`);
        showToastMessage('Logged out successfully', 'success');

      })
      .catch((error) => {
        console.error('Logout Error', error);
        showToastMessage('Error during logout', 'error');
      });
  };

  return (
    <>
      <Navbar className="bg-black w-full px-4 md:px-8 lg:px-16 rounded-none border border-none" placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Typography as="a" href="#" className="text-white text-2xl font-bold" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              <Camera className="h-6 w-6 text-red-500" />
            </Typography>

            <Typography as="a" href="#" className="text-white text-xl md:text-xl lg:text-2xl font-bold" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              CaptureCrew
            </Typography>
          </div>

          <div className="hidden sm:flex gap-6 md:gap-8 lg:gap-10 items-center text-white ">
            <Typography as="a" href={VENDOR.DASHBOARD} className="cursor-pointer font-semibold  text-md md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              HOME
            </Typography>
            <Typography as="a" href="#" className="cursor-pointer font-semibold text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined} onClick={handleProfileClick}
              onPointerLeaveCapture={undefined}>
              PROFILE
            </Typography>
            <Typography as="a" href={VENDOR.VIEW_POSTS} className="cursor-pointer font-semibold text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              CONTENTS
            </Typography>
            <Typography as="a"  href={VENDOR.REVIEW} className="cursor-pointer font-semibold text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              REVIEWS
            </Typography>
            <Typography as="a" href={VENDOR.REQUEST_BOOKING} className="cursor-pointer font-semibold text-sm md:text-base lg:text-lg hover:text-gray-300 transition-all" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              BOOKING REQUEST
            </Typography>
          </div>

          <div className="flex items-center gap-4">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  name={vendor?.name}
                  size="sm"
                  src={vendor?.imageUrl || 'images/user1.jpg'}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions">
                <DropdownItem key="profile" startContent={<User size={20} />} onClick={handleProfileClick}>
                  Profile
                </DropdownItem>
                <DropdownItem key="logout" className="text-danger" color="danger" startContent={<Slash size={20} />}
                  onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <MessageCircle className="text-white w-6 h-6 cursor-pointer"  onClick={()=>navigate(`${VENDOR.CHAT}`)}/>

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

        <MobileNav open={openNav}>
          <div className="flex flex-col gap-4 items-center text-white">
            <Typography as="a" href={VENDOR.DASHBOARD} className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              HOME
            </Typography>
            <Typography as="a" href={VENDOR.PROFILE} className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              PROFILE
            </Typography>
            <Typography as="a" href={VENDOR.VIEW_POSTS} className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              CONTENTS
            </Typography>
            <Typography as="a" href={VENDOR.REVIEW} className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              REVIEWS
            </Typography>
            <Typography as="a" href={VENDOR.REQUEST_BOOKING} className="cursor-pointer text-lg" placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              BOOKING REQUEST 
            </Typography>
          </div>
        </MobileNav>
      </Navbar>


    </>
  );
}
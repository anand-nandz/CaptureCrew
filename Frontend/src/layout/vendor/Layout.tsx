import  { useState, useEffect } from 'react';
import { Navbar, MobileNav, Typography, IconButton } from "@material-tailwind/react";
import { MessageCircle } from 'lucide-react';

export default function LayoutVendor() {
  const [openNav, setOpenNav] = useState(false);
 
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 768 && setOpenNav(false),
    );
  }, []);
 
  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 md:mb-0 md:mt-0 md:flex-row md:items-center">
      {["HOME", "PROFILE", "CONTENTS", "REVIEWS", "REQUEST QUOTES", "LOG OUT"].map((item) => (
        <Typography
          key={item}
          as="li"
          variant="small"
          color="blue-gray"
          placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}
          className="p-1 font-medium text-base md:text-sm lg:text-base xl:text-lg"
        >
          <a href="#" className="flex items-center hover:text-blue-500 transition-colors">
            {item}
          </a>
        </Typography>
      ))}
    </ul>
  );
 
  return (
    <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}} >
      <div className="flex items-center justify-between text-blue-gray-900">
        <div className="flex items-center gap-4">
          <img
            src="/api/placeholder/48/48" 
            alt="Capture Crew Logo"
            className="h-8 w-8 mr-2"
          />
          <Typography
            as="a"
            href="#"
            placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}
            className="cursor-pointer py-1.5 font-medium hidden sm:block"
          >
            Capture Crew
          </Typography>
        </div>
        
        <div className="hidden md:block flex-grow mx-4">
          {navList}
        </div>
        
        <div className="flex items-center gap-x-1">
          <MessageCircle className="h-6 w-6 cursor-pointer hover:text-blue-500 transition-colors" />
          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent md:hidden"
            ripple={false}
            placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </IconButton>
        </div>
      </div>
      <MobileNav open={openNav}>
        {navList}
      </MobileNav>
    </Navbar>
  );
}
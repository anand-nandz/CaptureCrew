import { useEffect, useState } from 'react'
import { Typography } from "@material-tailwind/react";
const CAROUSEL_IMAGES = [
    '/images/caro1.jpg',
    '/images/caro2.jpg',
    '/images/caro3.jpg',
  ];
const HeroBanner = () => {
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    useEffect(() => {
        const intervalId = setInterval(() => {
          setBackgroundIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
        }, 2000);
        return () => clearInterval(intervalId);
      }, []);
      
  return (
    <div className="relative w-full h-screen overflow-hidden">
    <div
      className="absolute inset-0 w-full h-full animate-BgAnimation bg-cover bg-center transition-transform duration-500 ease-in-out transform scale-105"
      style={{ backgroundImage: `url(${CAROUSEL_IMAGES[backgroundIndex]})` }}
    />
    <div className="absolute inset-0 bg-black bg-opacity-50" />

    <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Typography
          variant="h1"
          color="white"
          placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
          className="mb-4 text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-lemon animate-fadeIn"
        >
          Craft Unforgettable Moments: Your Event Starts Here
        </Typography>
        <Typography
          variant="lead"
          color="white"
          placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
          className="mb-12 opacity-80 font-judson text-lg sm:text-xl md:text-2xl animate-slideIn"
        >
          Every event is a blank canvas waiting for your imagination to
          paint the perfect picture. Let's create memories that last a
          lifetime.
        </Typography>
      </div>
    </div>
  </div>
  )
}

export default HeroBanner
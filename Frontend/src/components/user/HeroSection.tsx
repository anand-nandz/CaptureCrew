import { Carousel, Typography, Button } from "@material-tailwind/react";
import { motion } from 'framer-motion';
import HeroBanner from "./HeroBanner";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../validations/common/toast";
import { USER } from "../../config/constants/constants";
import { useCallback, useEffect, useState } from 'react';
import { VendorData, VendorResponse } from '../../types/vendorTypes';
import { axiosInstance } from '../../config/api/axiosInstance';
import { CATEGORIES, services } from "@/utils/utils";
import { CarouselArrowProps, CarouselNavigationProps } from "@/utils/interfaces";


const CAROUSEL_IMAGES = [
  '/images/caro1.jpg',
  '/images/caro2.jpg',
  '/images/caro3.jpg',
];


const HeroSection = () => {
  const [vendors, setVendors] = useState<VendorData[]>([])

  const fetchData = useCallback(async () => {

    try {
      const response = await axiosInstance.get<VendorResponse>('/vendors', {
        params: {
          limit: 5,
        }
      })

      const transformedVendors: VendorData[] = response.data.vendors
        .map((vendor) => ({
          ...vendor._doc,
          imageUrl: vendor.imageUrl
        }))
        .sort((a, b) => b.totalRating! - a.totalRating!);

      setVendors(transformedVendors);

    } catch (error) {
      console.error('Error fetching details:', error);
    }
  }, [])



  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigate = useNavigate()

  const CarouselNavigation = ({ setActiveIndex, activeIndex, length }: CarouselNavigationProps) => (
    <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`block h-3 w-3 cursor-pointer rounded-full transition-colors content-[''] ${activeIndex === i ? "bg-white" : "bg-white/50"
            }`}
          onClick={() => setActiveIndex(i)}
        />
      ))}
    </div>
  );

  const PrevArrow = ({ handlePrev }: CarouselArrowProps) => (
    <button
      onClick={handlePrev}
      className="absolute top-2/4 left-4 -translate-y-2/4 rounded-full bg-white/30 p-3 text-white hover:bg-white/60 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );

  const NextArrow = ({ handleNext }: CarouselArrowProps) => (
    <button
      onClick={handleNext}
      className="absolute top-2/4 !right-4 -translate-y-2/4 rounded-full bg-white/30 p-3 text-white hover:bg-white/60 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  );

  const handleProfileClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      navigate(`${USER.VENDORLIST}`)
    } catch (error) {
      console.log('Profile Error', error);
      showToastMessage('Error during loading profile', 'error');
    }

  }

  const viewPorfolio = (vendorId: string) => {
    navigate(`${USER.PORTFOLIO}/${vendorId}`)
  }

  return (
    <>
      <HeroBanner />

      {/* Vendors Section */}
      <section className="relative container mx-auto px-4 mb-3">
        <h2 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] py-10 md:py-20 uppercase text-center">
          Popular Vendors
        </h2>
        <div className="flex justify-center items-center w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          {vendors.map((vendor, index) => (
            <motion.div
              key={index}
              className="relative w-1/5 md:w-2/12 h-full cursor-pointer overflow-hidden border border-gray-300"
              whileHover={{
                width: '25%',
                transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => viewPorfolio(vendor._id)}
            >
              <img
                src={vendor.imageUrl || '/images/p5.jpg'}
                alt={vendor.name}
                className="w-full h-full object-cover transition-all duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end justify-center p-2 md:p-4">
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-center">
                  {vendor.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-xl text-yellow-600 font-light tracking-wide mb-2">MOMENTS</h3>
            <h2 className="text-4xl font-serif font-light text-gray-900">What We Do</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full aspect-square mb-6 overflow-hidden border border-gray-200">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-serif font-light mb-4 text-gray-900">{service.title}</h3>
                <p className="text-sm text-center text-gray-600 max-w-xs">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-light tracking-[0.3em] text-[#B8860B] mb-12 uppercase text-center"
        >
          Categories
        </motion.h2>
        <div className="max-w-6xl mx-auto">
          <div className="p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CATEGORIES.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="aspect-w-16 aspect-h-9 mb-6">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <Typography variant="h4" color="blue-gray" className="mb-4 text-center uppercase"
                    onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
                  >
                    {category.title}
                  </Typography>
                  <Typography variant="paragraph" color="gray" className="mb-6 text-center"
                    onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
                  >
                    {category.description}
                  </Typography>
                  <div className="flex justify-center">
                    <Button color="gray" size="lg" className="bg-black p-3 rounded-2xl"
                      onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
                      onClick={handleProfileClick}>
                      Explore
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <div className="relative">
        <Carousel
          autoplay
          loop
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="rounded-xl h-[80vh]"
          navigation={CarouselNavigation}
          prevArrow={PrevArrow}
          nextArrow={NextArrow}
        >
          {CAROUSEL_IMAGES.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`image ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ))}
        </Carousel>
      </div>
    </>
  );
};

export default HeroSection;
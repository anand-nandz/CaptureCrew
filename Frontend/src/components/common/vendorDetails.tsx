
import { Star, StarHalf } from 'lucide-react'
import { VendorData } from '../../types/vendorTypes';
import { useLocation, useNavigate } from 'react-router-dom';
import {  USER, VENDOR } from '../../config/constants/constants';

interface VendorProps {
  isVendor?: boolean,
  vendorDetails: VendorData;
}
export default function VendorDetails({ isVendor, vendorDetails }: VendorProps) {
  console.log(vendorDetails);
  
  const location = useLocation();
  const isVendorDashboard = location.pathname.includes('/vendor');
  const navigate =  useNavigate()

  const handleAvailability = ()=>{
    if(isVendor === true){
      navigate(`${VENDOR.DATE_AVAILABILTY}`)
    } else {
      navigate(`${USER.SERVICE_AVAILABILTY}/${vendorDetails._id}`)
    }
    
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}

        <main>
          {/* About Us Section */}
          <section className="py-14">
            <div className="container mx-auto px-4">

              <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
                <div className="w-full md:w-1/2">
                  <img
                    src={vendorDetails?.imageUrl || "/images/p5.jpg?height=300&width=300"}
                    alt="Founder"
                    className="w-3/5 h-3/5 max-w-md mx-auto rounded-lg shadow-lg  "
                  />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left my-5 mx-3">
                  <h2 className="text-3xl font-bold mb-4">About us</h2>
                  <p className="mb-4 text-gray-600">
                    {vendorDetails.about}
                  </p>
                  <p className="font-semibold mb-1">{vendorDetails.name}</p>
                  <p className="font-semibold mb-1">{vendorDetails.companyName}</p>
                  <p className="text-sm text-gray-500 mb-4">FOUNDER</p>
                  <div className="flex justify-center md:justify-start mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400" />
                    <StarHalf className="w-5 h-5 text-yellow-400" />
                  </div>
                  

                  <button className="bg-red-800 text-white px-6 py-2 rounded-full hover:bg-red-700 transition duration-300">
                    Message Us
                  </button>

                  <button className="bg-red-800 text-white px-6 py-2 rounded-full hover:bg-red-700 transition duration-300 ml-2"
                  onClick={handleAvailability}
                  >
                    {isVendorDashboard ? 'Update Availability' : 'Show Availability'}
                  </button>

                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
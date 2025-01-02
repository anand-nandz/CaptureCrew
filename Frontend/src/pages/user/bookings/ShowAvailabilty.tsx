import Loader from "@/components/common/Loader";
import { UnifiedCalendar } from "@/components/vendor/AvailabiltyCalender"
import { axiosInstance } from "@/config/api/axiosInstance"
import UserNavbar from "@/layout/user/navbar";
import { VendorData } from "@/types/vendorTypes";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

const ShowAvailabilty = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [vendor,setVendor]= useState<VendorData | null>(null)
    const [packages, setPackages] = useState([]);
    const { vendorId } = useParams()

    useEffect(() => {
        fetchPosts()
    }, [vendorId])

    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/portfolio/${vendorId}`)

            if (response.data.data.vendor) {
                setVendor(response.data.data.vendor);
            }
            if (Array.isArray(response.data.data.package)) {
                setPackages(response.data.data.package);
            }
            
        } catch (error) {
            console.error('Error fetching posts:', error)
            if(error instanceof AxiosError){
                showToastMessage(error.response?.data.message,'error')
            } else {
                showToastMessage('failed to load post','error')
            }
        } finally {
            setIsLoading(false)
        }
    }
  return (
   <>
   <UserNavbar/>
   {!isLoading ? <UnifiedCalendar isVendor={false} vendorDetails={vendor} packages={packages} axiosInstance={axiosInstance}/> : <Loader/>}
   
   </>
  )
}

export default ShowAvailabilty
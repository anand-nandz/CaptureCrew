import { useEffect, useState } from "react";
import { axiosInstanceVendor } from "../../../config/api/axiosInstance";
import VendorDetails from "../../../components/common/vendorDetails";
import ImageMasonry from "../../common/imageMasonary";
import { useSelector } from "react-redux";
import VendorRootState from "@/redux/rootstate/VendorState";

const MainSectionVendor = () => {
    const vendordetails = useSelector((state: VendorRootState) => state.vendor.vendorData);
    const [vendor, setVendor] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstanceVendor.get('/vendorDetails');
            if (response?.data?.vendor) {
                setVendor(response.data.vendor);
            }
        } catch (error) {
            console.error('Error fetching vendor details:', error);
        }
    };


    return (
        <div className="w-full  mx-auto ">
            {vendor ? (
                <>

                    <div className="space-y-8">
                        <VendorDetails isVendor={true} vendorDetails={vendordetails} />
                        <ImageMasonry vendorDetails={vendor} />
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    Loading vendor details...
                </div>
            )}
        </div>
    );
};

export default MainSectionVendor;
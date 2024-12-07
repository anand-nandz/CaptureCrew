import { useEffect, useState } from "react";
import { axiosInstanceVendor } from "../../../config/api/axiosInstance";
import VendorDetails from "../../../components/common/vendorDetails";
import ImageMasonry from "../../common/imageMasonary";

const MainSectionVendor = () => {
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
            console.log(response.data.vendor.post);
        } catch (error) {
            console.error('Error fetching vendor details:', error);
        }
    };

    return (
        <div className="w-full  mx-auto ">
            {vendor ? (
                <>

                    <div className="space-y-8">
                        <VendorDetails isVendor={true} vendorDetails={vendor} />
                        <ImageMasonry vendorData={vendor} />
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
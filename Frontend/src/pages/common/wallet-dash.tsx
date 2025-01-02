

import CreditCards from "@/components/common/creditCard"
import Sidebar from "@/layout/user/Sidebar"
import { UserData } from "@/types/userTypes"
import { showToastMessage } from "@/validations/common/toast"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { USER, VENDOR } from "@/config/constants/constants"
import { axiosInstance, axiosInstanceVendor } from "@/config/api/axiosInstance"
import Loader from "@/components/common/Loader"
import PaymentsList from "@/components/common/paymentList"
import { VendorData } from "@/types/vendorTypes"
import SidebarVendor from "@/layout/vendor/SidebarProfileVendor"

export default function WalletDashboard({ isVendor = false }) {
    const [details, setDetails] = useState<UserData | VendorData | null>(null);

    const navigate = useNavigate();

    const fetchProfileData = useCallback(async () => {
        try {
            const axiosinstance = isVendor ? axiosInstanceVendor : axiosInstance

            const response = await axiosinstance.get('/profile')

            setDetails(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error instanceof Error) {
                showToastMessage(error.message || 'Error loading profile', 'error');
            } else {
                showToastMessage('An unknown error occurred', 'error');
            }
            navigate(isVendor ? VENDOR.LOGIN : USER.LOGIN);
        }
    }, [navigate, isVendor]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);


    if (!details) {
        return <div><Loader /></div>;
    }

    return (
        <div className="flex bg-gray-50">
            <div className="md:block">
                {isVendor ? <SidebarVendor /> : <Sidebar />}
            </div>
            <div className="flex-1 flex flex-col overflow-x-auto  pt-10 ps-4 w-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800 px-4">
                        {isVendor ? 'Vendor Transactions' : 'My Transactions'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 px-3">
                        <CreditCards
                            accountDetails={{
                                name: details.name,
                                walletBalance: details.walletBalance,
                                contactinfo: details.contactinfo
                            }}
                            type={isVendor ? 'vendor' : 'user'}
                        />
                    </div>

                    <div className="md:col-span-2 px-3">
                        <PaymentsList
                            transactions={details.transactions}
                            type={isVendor ? 'vendor' : 'user'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}


import React, { useCallback, useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    Typography,
} from "@material-tailwind/react";
import { CalendarDays, Mail, Phone, Badge, Clock, VerifiedIcon } from "lucide-react";
import { showToastMessage } from "../../../validations/common/toast";
import { useNavigate } from "react-router-dom";
import { VENDOR } from "../../../config/constants/constants";
import ChangePasswordModal, { PasswordFormData } from "../../common/changePassword";
import { VendorData } from "../../../types/vendorTypes";
import { axiosInstanceVendor } from "../../../config/api/axiosInstance";
import EditProfileModalVendor from "./editProfileVendor";
import Loader from "../../../components/common/Loader";
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor";


function VendorProfile() {
    const [vendor, setVendor] = useState<VendorData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [bookingCount, setBookingCount] = useState(0);

    const navigate = useNavigate();


    const fetchProfileData = useCallback(async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            if (!token) {
                showToastMessage('Authentication required', 'error');
                navigate(VENDOR.LOGIN);
                return;
            }

            const response = await axiosInstanceVendor.get('/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })           
            setVendor(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error instanceof Error) {
                showToastMessage(error.message || 'Error loading profile', 'error');
            } else {
                showToastMessage('An unknown error occurred', 'error');
            }
            navigate(VENDOR.LOGIN);
        }
    }, [navigate]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    useEffect(() => {
        const fetchBookingCount = async () => {
            try {
                const response = await axiosInstanceVendor.get('/bookings');                
                setBookingCount(response.data.bookingConfirmed.length);
            } catch (error) {
                console.error('Error fetching booking count:', error);
                showToastMessage('Error fetching booking count', 'error');
            }
        };

        fetchBookingCount();
        const interval = setInterval(fetchBookingCount, 60000); 

        return () => clearInterval(interval);
    }, []);

    const handleSaveProfile = useCallback(async (updates: FormData) => {
        try {
            const token = localStorage.getItem('vendorToken');
            if (!token) {
                showToastMessage('Authentication required', 'error');
                return;
            }

            const response = await axiosInstanceVendor.put('/profile', updates,{
                headers : {"Content-Type" : 'multipart/form-data'}
            });
            setVendor(response.data);
            showToastMessage('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToastMessage('Error updating profile', 'error');
        }
    }, []);

    const handlePasswordChange = async (passwordData: PasswordFormData) => {
        try {
            const token = localStorage.getItem('vendorToken');
            await axiosInstanceVendor.put('/change-password', passwordData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            showToastMessage('Password changed successfully', 'success');
        } catch (error) {
            console.error('Error changing password aannd:', error);
            throw error;
        }
    };
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    if (!vendor) {
        return <div><Loader /></div>;
    }

    return (
        <div className="flex ">
            <div>
                <SidebarVendor />
            </div>

            <section className="container mx-auto ">
                <Card className="w-full mb-6" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <div className="relative h-64 w-full overflow-hidden ">
                        <img src={"/images/cate1.jpg"} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold">{vendor.companyName}</h1>
                            <h1 className="text-white text-lg  md:text-xl lg:text-2xl font-normal">{vendor.city}</h1>
                        </div>
                    </div>

                    <div className="relative px-6 py-8">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="flex items-center gap-6">
                                <Avatar
                                    size="xxl"
                                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                    className="h-32 w-32 ring-4 ring-white -mt-20 relative"
                                    src={vendor?.imageUrl || "/images/user.png"}

                                />
                                <div className="space-y-1">
                                    <Typography variant="h4" className="text-2xl font-bold text-black" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                        <div className="flex items-center">
                                            <div>{vendor.name} </div>
                                            <div className="flex justify-center">
                                                {vendor.isVerified && (
                                                    <VerifiedIcon className="h-5 w-5 ml-1 items-center text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-black" />
                                        <Typography className="text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            {vendor.email}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-black" />
                                        <Typography className="text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            {vendor.contactinfo}
                                        </Typography>
                                    </div>
                                </div>
                            </div>


                            <div className="flex items-end gap-2">
                                <div className="flex items-center gap-2">
                                    
                                    <Typography className="text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                       ABOUT : {vendor.about}
                                    </Typography>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 rounded-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <Card className="p-4 bg-gray-50" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <Typography variant="h6" color="blue-gray" className="mb-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    Account Information
                                </Typography>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="h-5 w-5 text-black" />
                                        <Typography className="text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            ID: {vendor._id}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-black" />
                                        <Typography className="text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            Member since: {formatDate(vendor.createdAt)}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-black" />
                                        <Typography className="text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            Last updated: {formatDate(vendor.updatedAt)}
                                        </Typography>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gray-50" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <Typography variant="h6" color="blue-gray" className="mb-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    Activity Summary
                                </Typography>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <Typography className="text-2xl font-bold text-black" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            {vendor.totalRating}
                                        </Typography>
                                        <Typography className="text-sm text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            Ratings
                                        </Typography>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <Typography className="text-2xl font-bold text-black" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            {bookingCount}
                                        </Typography>
                                        <Typography className="text-sm text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            Bookings
                                        </Typography>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                size="sm"
                                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 bg-black"

                            >
                                Edit Profile
                            </Button>
                            <Button
                                size="sm"
                                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                variant="outlined"
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>
            {vendor && (
                <EditProfileModalVendor
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    vendor={vendor}
                    onSave={handleSaveProfile}
                />

            )}
            {vendor && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={handlePasswordChange}
                />
            )}
        </div>

    );

}

export default React.memo(VendorProfile);
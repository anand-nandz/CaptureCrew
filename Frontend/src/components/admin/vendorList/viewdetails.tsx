import React from "react";
import {
    Input,
    Typography,

} from "@material-tailwind/react";
import { format } from "date-fns";
import { AcceptanceStatus, VendorData } from "../../../types/vendorTypes";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface VendorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: VendorData | null;
}

const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({
    isOpen,
    onClose,
    vendor,
}) => {

    if (!isOpen || !vendor) return null;

    const joinedDate = new Date(vendor.createdAt);

    const getStatusColor = (status: AcceptanceStatus) => {
        switch (status) {
            case AcceptanceStatus.Accepted:
                return "bg-green-100 text-green-700";
            case AcceptanceStatus.Rejected:
                return "bg-red-100 text-red-700";
            case AcceptanceStatus.Requested:
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="flex w-full max-w-6xl flex-col gap-4 lg:flex-row">
                {/* Profile Section */}
                <div className="w-full rounded-lg bg-white p-6 lg:w-1/3">
                    <div className="flex flex-col items-center">
                        <div className="mb-6">
                            <img
                                src={ vendor?.imageUrl ||"/images/user.png"}
                                alt="avatar"
                                className="h-32 w-32 rounded-full object-cover object-center sm:h-36 sm:w-36 lg:h-28 lg:w-28 xl:h-32 xl:w-32"
                            />

                        </div>
                        <div className="text-center">
                            <Typography variant="h5" color="blue-gray" className="mb-2"
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                {vendor.name || "Vendor Name"}
                            </Typography>
                            <Typography variant="h6" color="blue-gray" className="mb-4 break-words"
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                {vendor.email || "email@example.com"}
                            </Typography>
                            <Typography color="blue-gray" className="text-sm"
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                {vendor.about || "About section not added yet."}
                            </Typography>

                        </div>

                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full rounded-lg bg-white p-6 lg:w-2/3">

                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        >
                            Vendor Details
                        </Typography>
                        <button onClick={onClose} className="text-zinc-800 hover:text-zinc-950">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Company Name
                                </Typography>
                                <Input
                                    size="md"
                                    value={vendor.companyName || "Not Added"}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Contact Info
                                </Typography>
                                <Input
                                    size="md"
                                    value={vendor.contactinfo?.toString() || "Not Added"}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    City
                                </Typography>
                                <Input
                                    size="md"
                                    value={vendor.city || "Not Added"}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Joined Date
                                </Typography>
                                <Input
                                    size="md"
                                    value={format(joinedDate, "PPP")}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Total Posts
                                </Typography>
                                <Input
                                    size="md"
                                    value={vendor.postCount?.toString() || "0"}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Total ReportCount
                                </Typography>
                                <Input
                                    size="md"
                                    value={vendor.reportCount?.toString() || "0"}
                                    readOnly
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    className="w-full"
                                    crossOrigin={undefined}
                                />
                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Status
                                </Typography>
                                <div className={`w-max rounded-full ${vendor.isActive ? "bg-green-100" : "bg-red-100"} px-4 py-2`}>
                                    <Typography className={vendor.isActive ? "text-green-700" : "text-red-700"}
                                        placeholder={undefined}
                                        onPointerEnterCapture={undefined}
                                        onPointerLeaveCapture={undefined}
                                    >
                                        {vendor.isActive ? "Active" : "Inactive"}
                                    </Typography>
                                </div>

                            </div>
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Verification Status
                                </Typography>
                                <div className={`w-max rounded-full px-4 py-2 ${getStatusColor(vendor.isAccepted)}`}>
                                    <Typography
                                        placeholder={undefined}
                                        onPointerEnterCapture={undefined}
                                        onPointerLeaveCapture={undefined}
                                    >
                                        {vendor.isAccepted.toUpperCase()}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default VendorDetailsModal;
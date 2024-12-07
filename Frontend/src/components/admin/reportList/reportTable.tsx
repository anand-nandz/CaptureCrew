import React, { useCallback, useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    CardFooter,
    Tabs,
    TabsHeader,
    Tab,
} from "@material-tailwind/react";
import { axiosInstanceAdmin } from "../../../config/api/axiosInstance";
import { showToastMessage } from '../../../validations/common/toast';
import Swal from 'sweetalert2';
import Loader from '../../common/Loader';
import { VendorData } from '@/types/vendorTypes';
import { PostData } from '@/types/postTypes';

interface Report {
    _id: string;
    reportedBy: {
        _id: string;
        name?: string;
        email?: string;
    };
    reportId: string;
    reportedItem: {
        itemId: string;
        type: string;
        details?: VendorData | PostData; 
    };
    reason: string;
    additionalDetails?: string;
    status: 'Pending' | 'Resolved' | 'Rejected';
    createdAt: string;
}

const TABS = [
    {
        label: "All Reports",
        value: "all",
    },
   
];

const TABLE_HEAD = ["Reported By",'ReportID', "Reported Item", "Reason", "Details", "Status", "Created At"];

export function ReportManagement() {
    const [reports, setReports] = useState<Report[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstanceAdmin.get('/client-reports', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchTerm,
                    status: activeTab !== 'all' ? activeTab : undefined
                }
            });

            setReports(response.data.reports);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToastMessage('Failed to fetch reports', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    // const handleReportAction = async (reportId: string, action: 'resolve' | 'reject') => {
    //     const actionText = action === 'resolve' ? 'Resolve' : 'Reject';
    //     const result = await Swal.fire({
    //         title: `Are you sure?`,
    //         text: `Do you want to ${actionText.toLowerCase()} this report?`,
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: action === 'resolve' ? '#3085d6' : '#d33',
    //         cancelButtonColor: '#6c757d',
    //         confirmButtonText: `Yes, ${actionText} Report!`
    //     });

    //     if (result.isConfirmed) {
    //         try {
    //             const response = await axiosInstanceAdmin.patch(`/reports/${reportId}/status`, {
    //                 status: action === 'resolve' ? 'Resolved' : 'Rejected'
    //             });

    //             showToastMessage(response.data.message, 'success');
    //             fetchData();
    //         } catch (error) {
    //             console.error(`Error ${actionText.toLowerCase()}ing report:`, error);
    //             showToastMessage(`Failed to ${actionText.toLowerCase()} report`, 'error');
    //         }
    //     }
    // };

    const handleViewReportDetails = (report: Report) => {
        Swal.fire({
            title: 'Report Details',
            html: `
                <div class="text-left">
                    <p><strong>ReportID:</strong> ${report.reportId}</p>
                    <p><strong>Reported Item:</strong> ${report.reportedItem.type} (ID: ${report.reportedItem.itemId})</p>
                    <p><strong>Reason:</strong> ${report.reason}</p>
                    <p><strong>Additional Details:</strong> ${report.additionalDetails || 'No additional details'}</p>
                    <p><strong>Status:</strong> ${report.status}</p>
                    <p><strong>Created At:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Close',
            confirmButtonColor: 'black',
            iconColor: 'red'
        });
    };

    return (
        <div className="max-w-7xl mt-5 mx-auto px-4 sm:px-6 lg:px-8">
            <CardHeader
                floated={false}
                shadow={false}
                className="rounded-none p-4 -mt-7 mb-4"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
            >
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
                    <Typography
                        variant="h5"
                        color="blue-gray"
                        className="text-center text-2xl lg:text-3xl md:text-2xl sm:text-xl"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        REPORT MANAGEMENT
                    </Typography>

                    <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
                        <Input
                            label="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                            crossOrigin={undefined}
                            placeholder="Search reports..."
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
                            labelProps={{
                                className: "hidden",
                            }}
                            containerProps={{
                                className: "min-w-[100px] relative"
                            }}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs value={activeTab} className="w-full">
                        <TabsHeader
                            className="w-full lg:w-max md:w-3/4 sm:w-full mx-auto"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        >
                            {TABS.map(({ label, value }) => (
                                <Tab
                                    key={value}
                                    value={value}
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    onClick={() => handleTabChange(value)}
                                    className={`
                                        ${activeTab === value ? "text-gray-900" : ""}
                                        text-sm lg:text-base px-8 md:text-sm sm:text-xs 
                                    `}
                                >
                                    {label}
                                </Tab>
                            ))}
                        </TabsHeader>
                    </Tabs>
                </div>
            </CardHeader>

            <Card
                className="w-full"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
            >
                <CardBody
                    className="overflow-x-auto px-0"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                >
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                            <tr>
                                {TABLE_HEAD.map((head) => (
                                    <th
                                        key={head}
                                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                                    >
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            placeholder={undefined}
                                            onPointerEnterCapture={undefined}
                                            onPointerLeaveCapture={undefined}
                                            className="font-normal leading-none opacity-70"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_HEAD.length} className="text-center p-4">
                                        <Loader />
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_HEAD.length} className="text-center p-4">
                                        No reports found
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report, index) => (
                                    <tr key={index} className="even:bg-blue-gray-50/50">
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                            >
                                                {report.reportedBy.name || report.reportedBy._id}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                            >
                                                {report.reportId}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                            >
                                                {report.reportedItem.type}
                                                <br />
                                                <small>{report.reportedItem.itemId}</small>
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                            >
                                                {report.reason}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                size="sm"
                                                variant="text"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                                onClick={() => handleViewReportDetails(report)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                        <td className="p-4">
                                            <div className={`w-max rounded-full 
                                                ${report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'} 
                                                px-2 py-1`}
                                            >
                                                <Typography
                                                    variant="small"
                                                    placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}
                                                >
                                                    {report.status}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                            >
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </td>
                                        {/* <td className="p-4">
                                            <div className="flex space-x-2">
                                                {report.status === 'Pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            color="green"
                                                            variant="outlined"
                                                            placeholder={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                            onClick={() => handleReportAction(report._id, 'resolve')}
                                                        >
                                                            Resolve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="red"
                                                            variant="outlined"
                                                            placeholder={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                            onClick={() => handleReportAction(report._id, 'reject')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardBody>
                <CardFooter
                    className="flex items-center justify-between border-t border-blue-gray-50 p-4"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                >
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        Page {currentPage} of {totalPages}
                    </Typography>
                    <div className="flex gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>

        </div>


    );
}
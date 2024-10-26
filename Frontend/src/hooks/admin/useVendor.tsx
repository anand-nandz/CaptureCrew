import React, { useCallback, useEffect, useState } from 'react';
import { AcceptanceStatus, VendorData } from '../../types/vendorTypes';
import Swal from 'sweetalert2';
import { axiosInstanceAdmin } from '../../config/api/axiosInstance';
import { showToastMessage } from '../../validations/common/toast';
import { ADMIN } from '../../config/constants/constants';
import { logout } from '../../redux/slices/VendorSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useVendor = () => {
    const [vendors, setVendors] = useState<VendorData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstanceAdmin.get('/vendors', {
                params: {
                    page: currentPage,
                    limit: 6,
                    search: searchTerm,
                    status: activeTab !== 'all' ? activeTab : undefined
                }
            });
            setVendors(response.data.vendors);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (vendor: VendorData) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVendor(null);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    const handleBlockUnblock = async (vendorId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'block' : 'unblock';
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${action} this vendor?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action} vendor!`
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstanceAdmin.patch(`/vendorblock-unblock?vendorId=${vendorId}`);
                showToastMessage(response.data.message, 'success');
                Swal.fire(
                    'Success!',
                    response.data.message,
                    'success'
                );

                if (response.data.processHandle === 'block') {
                    dispatch(logout());
                    navigate(`${ADMIN.LOGIN}`);
                } else {
                    fetchData();
                }
            } catch (error) {
                Swal.fire(
                    'Error',
                    'Failed to update vendor status',
                    'error'
                );
                console.error('Error while blocking/unblocking vendor', error);
            }
        }
    };

    const handleVerifyVendor = useCallback(async (vendorId: string) => {
        setIsLoading(true)
        const result = await Swal.fire({
            title: 'Verify Vendor',
            text: 'Do you want to accept or reject this vendor?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject'
        });

        let status: AcceptanceStatus;
        if (result.isConfirmed) {
            status = AcceptanceStatus.Accepted;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            status = AcceptanceStatus.Rejected;
        } else {
            setIsLoading(false);
            return; 
        }

        try {
            const response = await axiosInstanceAdmin.put(`/vendors/${vendorId}/status`, { status });
            showToastMessage(response.data.message, 'success');
            
            // Update vendors state
            setVendors(prevVendors =>
                prevVendors.map(vendor =>
                    vendor._id === vendorId
                        ? { ...vendor, isAccepted: status, isActive: status === AcceptanceStatus.Accepted }
                        : vendor
                )
            );
            
            // Update selectedVendor state
            setSelectedVendor(prevVendor => {
                if (prevVendor && prevVendor._id === vendorId) {
                    return {
                        ...prevVendor,
                        isAccepted: status,
                        isActive: status === AcceptanceStatus.Accepted
                    };
                }
                return prevVendor;
            });

        } catch (error) {
            console.error('Error verifying vendor:', error);
            showToastMessage('Failed to verify vendor', 'error');
        } finally {
            setIsLoading(false)
        }
    }, []);

    return {
        vendors,
        currentPage,
        totalPages,
        searchTerm,
        isLoading,
        activeTab,
        isModalOpen,
        selectedVendor,
        handleViewDetails,
        handleBlockUnblock,
        handleCloseModal,
        handleSearch,
        handleVerifyVendor,
        handleTabChange,
        setCurrentPage
    }
}

export default useVendor;
import { BookingConfirmed, BookingStatus } from "@/types/bookingTypes";
import { Button, Pagination } from "@nextui-org/react";
import { useEffect, useState } from "react";
import BookingConfirmedDetailsModal from "../common/BookingDetails";
import { axiosInstance } from "@/config/api/axiosInstance";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import PaymentMethodModal, { PaymentBookingData } from "@/pages/user/bookings/PaymentMethodModal";
import CancelModal from "@/pages/user/bookings/CancelModal";
import { BookingCancellationPolicyImpl } from "@/utils/bookingPolicyService";
import Swal from "sweetalert2";
import { ReviewFormModal } from "../common/ReviewModalForm";

type BookingConfirmedTableProps = {
    title: string;
    bookingConfirmed: BookingConfirmed[];
    isVendor?: boolean;
    onPayNow?: (bookingId: string, sbooking: PaymentBookingData, paymentType: 'finalAmount') => void;

};

interface Review {
    _id: string;
    bookingId: string;
    rating: number;
    content: string;
    userId?: string;
    vendorId?: string;
  }
  
  // Define the type for the existing reviews map
  type ExistingReviewsMap = Record<string, Review | null>;

export const BookingConfirmedTable: React.FC<BookingConfirmedTableProps> = ({
    bookingConfirmed,
    isVendor = false,
}) => {
    const [selectedBooking, setSelectedBooking] = useState<BookingConfirmed | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [reviewModal, setReviewModal] = useState(false);
    const [existingReviews, setExistingReviews] = useState<ExistingReviewsMap>({});


    useEffect(() => {
        const fetchExistingReviews = async () => {
            // Check for existing reviews for completed bookings
            const completedBookings = bookingConfirmed.filter(
                booking => !isVendor && booking.bookingStatus === 'completed'
            );

            const reviewPromises = completedBookings.map(async (booking) => {
                try {
                    const response = await axiosInstance.get(`/checkReview/${booking._id}`, {
                        withCredentials: true
                    });
                    return {
                        bookingId: booking._id,
                        review: response.data.review || null
                    };
                } catch (error) {
                    console.error(`Error checking review for booking ${booking._id}:`, error);
                    return {
                        bookingId: booking._id,
                        review: null
                    };
                }
            });

            try {
                const reviewResults = await Promise.all(reviewPromises);

                const reviewMap = reviewResults.reduce<ExistingReviewsMap>((acc, result) => {
                    acc[result.bookingId] = result.review;
                    return acc;
                }, {});

                setExistingReviews(reviewMap);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (reviewModal || bookingConfirmed.length > 0) {
            fetchExistingReviews();
        }
    }, [bookingConfirmed,reviewModal,isVendor]);


    const itemsPerPage = 4;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'ongoing':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePayNowClick = (booking: BookingConfirmed) => {
        setSelectedBooking(booking);
        setIsPaymentModalOpen(true);
        setIsCancelModalOpen(false);

    };

    const handleCancelClick = (booking: BookingConfirmed) => {
        setSelectedBooking(booking);
        setIsCancelModalOpen(true);
        setIsPaymentModalOpen(false);
    };

    const processPayment = async (booking: PaymentBookingData, paymentMethod: string) => {
        try {
            const paymentData = {
                bookingId: booking._id,
                sbooking: booking,
                paymentType: 'finalAmount',
                paymentMethod
            };


            const paymentEndpoint = paymentMethod === 'stripe' ? '/stripe-payments' : '/razorpay-payment';
            const paymentResponse = await axiosInstance.post(paymentEndpoint, paymentData);

            if (paymentResponse.data.success) {
                const checkoutUrl = paymentResponse?.data.result.url;
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    showToastMessage("Payment URL generation failed", 'error');
                }
            } else {
                showToastMessage(paymentResponse.data.message || "Payment initialization failed", 'error');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            if (error instanceof AxiosError) {
                showToastMessage(error.response?.data.message || 'Error processing payment', 'error');
            } else {
                showToastMessage('An unknown error occurred', 'error');
            }
        }
    };

    const cancelPayment = async (booking: BookingConfirmed, cancellationReason: string) => {
        setIsCancelling(true);
        try {
            const cancellationPolicy = new BookingCancellationPolicyImpl();
            const refundEligibility = cancellationPolicy.calculateRefundEligibility(booking);

            if (!refundEligibility.isEligible) {
                showToastMessage(refundEligibility.reason || "Cancellation not allowed", 'error');
                return;
            }
            if (cancellationReason.trim().length < 10) {
                showToastMessage("Please provide a detailed cancellation reason (minimum 10 characters)", 'error');
                return;
            }
            const result = await Swal.fire({
                title: 'Cancel Booking',
                html: `
                    <div class="booking-cancellation-details">
                        <div class="detail-row">
                            <strong>Booking ID:</strong>
                            <span>${booking.bookingId}</span>
                        </div>
                        
                        <div class="detail-row">
                            <strong>Refund Percentage:</strong>
                            <span class="${refundEligibility.userRefundPercentage > 50
                        ? 'text-green'
                        : 'text-orange'
                    }">
                                ${refundEligibility.userRefundPercentage}%
                            </span>
                        </div>
                        
                        <div class="cancellation-reason">
                            <h4>Cancellation Reason</h4>
                            <p>${cancellationReason}</p>
                        </div>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#000',
                cancelButtonColor: '#000',
                confirmButtonText: 'Yes, Cancel Booking',
                cancelButtonText: 'No, Keep Booking',
                showLoaderOnConfirm: true,
                didRender: () => {
                    const style = document.createElement('style');
                    style.textContent = `
                        .booking-cancellation-details {
                            text-align: left;
                            padding: 10px;
                        }
                        
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 10px;
                            padding: 5px 0;
                            border-bottom: 1px solid #f0f0f0;
                        }
                        
                        .detail-row strong {
                            color: #666;
                            font-weight: 500;
                        }
                        
                        .detail-row span {
                            font-weight: 600;
                        }
                        
                        .text-green {
                            color: #28a745;
                        }
                        
                        .text-orange {
                            color: #ffc107;
                        }
                        
                        .cancellation-reason {
                            background-color: #f9f9f9;
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                        }
                        
                        .cancellation-reason h4 {
                            margin-bottom: 5px;
                            color: #333;
                        }
                        
                        .cancellation-reason p {
                            color: #666;
                            font-style: italic;
                        }
                    `;
                    document.head.appendChild(style);
                },
                preConfirm: async () => {
                    try {
                        const cancelResponse = await axiosInstance.post('/cancel-booking', {
                            bookingId: booking.bookingId,
                            cancellationReason: cancellationReason
                        });

                        if (cancelResponse.data.success) {
                            return true; // Indicate success
                        } else {
                            throw new Error(
                                cancelResponse.data.message ||
                                cancelResponse.data.code ||
                                "Booking cancellation failed"
                            );
                        }
                    } catch (error) {
                        if (error instanceof AxiosError) {
                            const errorResponse = error.response?.data;

                            // More specific error handling
                            if (errorResponse?.message) {
                                Swal.showValidationMessage(errorResponse.message);
                            } else if (error.response?.status === 500) {
                                Swal.showValidationMessage('Server error. Please try again later.');
                            } else {
                                showToastMessage('An unexpected error occurred', 'error');
                            }
                        }
                        return false;
                    }
                }
            });

            if (result.isConfirmed) {

                showToastMessage("Booking successfully cancelled", 'success');
                setIsCancelling(false);
                setIsCancelModalOpen(false);
                setSelectedBooking(null);


                // try {
                //     const cancelResponse = await axiosInstance.post('/cancel-booking', { 
                //         bookingId: booking.bookingId, 
                //         cancellationReason: cancellationReason 
                //     });

                //     console.log(cancelResponse, 'cancelResponse.............');
                //     if (cancelResponse.data.success) {
                //         showToastMessage("Booking successfully cancelled", 'success');
                //     } else {
                //         showToastMessage(
                //             cancelResponse.data.message || 
                //             cancelResponse.data.code || 
                //             "Booking cancellation failed", 
                //             'error'
                //         );
                //     }
                // } catch (error) {
                //     console.error('Error in refunding:', error);
                //     if (error instanceof AxiosError) {
                //         const errorResponse = error.response?.data;

                //         // More specific error handling
                //         if (errorResponse?.message) {
                //             showToastMessage(errorResponse.message, 'error');
                //         } else if (error.response?.status === 500) {
                //             showToastMessage('Server error. Please try again later.', 'error');
                //         } else {
                //             showToastMessage('An unexpected error occurred', 'error');
                //         }
                //     } else {
                //         // Handle non-Axios errors
                //         showToastMessage('An unexpected error occurred', 'error');
                //     }
                // }

            } else {
                showToastMessage("Cancellation cancelled", 'error');
                setIsCancelling(false);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            if (error instanceof AxiosError) {
                showToastMessage(error.response?.data.message || 'Error processing payment', 'error');
            }

            showToastMessage('An unknown error occurred', 'error');
            setIsCancelling(false);
        } finally {
            setIsCancelling(false);
        }
    };

    const shouldShowFinalAmountPayButton = (booking: BookingConfirmed) => {
        const today = new Date();
        const finalAmountDueDate = new Date(booking.finalPayment.dueDate);

        return (
            booking.advancePayment.status === 'completed' &&
            booking.finalPayment.status !== 'completed' &&
            today <= finalAmountDueDate
        );
    };

    const shouldShowCancelButton = (booking: BookingConfirmed) => {
        const today = new Date();
        const finalAmountDueDate = new Date(booking.finalPayment.dueDate);

        return (
            booking.advancePayment.status === 'completed' &&
            booking.finalPayment.status !== 'completed' &&
            today <= finalAmountDueDate
        );
    };

    const renderPaymentButton = (booking: BookingConfirmed) => {
        if (shouldShowFinalAmountPayButton(booking)) {
            return (
                <Button
                    size="sm"
                    className="bg-custom-button hover:bg-custom-button-hover text-white"
                    onPress={() => handlePayNowClick(booking)}
                >
                    Pay Now
                </Button>
            );
        }

        return null;
    };
    const renderCancelButton = (booking: BookingConfirmed) => {
        if (shouldShowCancelButton(booking)) {
            return (
                <Button
                    size="sm"
                    className="bg-custom-button hover:bg-custom-button-hover text-white"
                    onPress={() => handleCancelClick(booking)}
                >
                    Cancel Now
                </Button>
            );
        }

        return null;
    };


    const totalPages = Math.ceil(bookingConfirmed.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = bookingConfirmed.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isVendor ? 'Client Name' : 'Company Name'}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Type
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date and Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date and Amount
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            View Details
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentBookings.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-5 py-4 text-center text-gray-500">
                                No confirmed bookings found
                            </td>
                        </tr>
                    ) : (
                        currentBookings.map((booking, index) => (
                            <tr key={booking._id}>
                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {startIndex + index + 1}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.bookingId}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {isVendor ? booking.clientName : booking.vendorId.companyName}
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.serviceType}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="space-y-1">
                                        <div>
                                            {booking.startingDate}
                                        </div>
                                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                            {booking.bookingStatus.toUpperCase()}
                                        </div>
                                    </div>

                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                        <div>
                                            <span className="text-xs font-medium">Adv: </span>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.advancePayment.status)}`}>
                                                {booking.advancePayment.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {booking.advancePayment.status !== 'refunded' && (
                                            <div>
                                                <span className="text-xs font-medium">Final: </span>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.finalPayment.status)}`}>
                                                    {booking.finalPayment.status.toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-sm">
                                    {booking.advancePayment.status !== 'refunded' ? (

                                        <div className="space-y-1">
                                            <div>
                                                <span className="font-medium">Amt: </span>
                                                {`₹ ${booking.finalPayment.amount}`}
                                            </div>
                                            <div>
                                                <span className="font-medium">Final: </span>
                                                {formatDate(booking.finalPayment.dueDate)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-medium">Due: </span>
                                            {`N/A`}
                                        </div>
                                    )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        onPress={() => {
                                            setSelectedBooking(booking);
                                            setIsDetailsModalOpen(true);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                        <div> {!isVendor && booking.bookingStatus !== 'cancelled' && (renderPaymentButton(booking))}</div>
                                        <div>{!isVendor && booking.bookingStatus !== 'cancelled' && (renderCancelButton(booking))}</div>
                                        <div>
                                            {!isVendor && booking.bookingStatus === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="bordered"
                                                    onPress={() => {
                                                        setSelectedBooking(booking);
                                                        setReviewModal(true)
                                                    }}
                                                >
                                                    {existingReviews[booking._id] ? 'Edit Review' : 'Rate Us'}
                                                </Button>

                                            )}
                                        </div>
                                    </div>
                                </td>


                            </tr>

                        ))
                    )}
                </tbody>
            </table>

            {selectedBooking && (
                <PaymentMethodModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    isConfirmed={true}
                    onProcessPayment={processPayment}
                />
            )}
            {selectedBooking && (
                <CancelModal
                    isOpen={isCancelModalOpen}
                    onClose={() => {
                        if (!isCancelling) {
                            setIsCancelModalOpen(false);
                            setSelectedBooking(null);
                        }
                    }}
                    booking={selectedBooking}
                    onProcessPayment={cancelPayment}
                    isCancelling={isCancelling}
                />
            )}
            {selectedBooking && <ReviewFormModal
                isOpen={reviewModal}
                onOpenChange={setReviewModal}
                bookingDetails={{
                    vendorId: selectedBooking.vendorId?._id,
                    bookingId: selectedBooking?._id,
                    bookingNumber: selectedBooking.bookingId,
                    existingReview: existingReviews[selectedBooking._id]
                }}

            />}

            {/* Mobile view */}
            <div className="md:hidden">
                {currentBookings.map((booking) => (
                    <div key={booking._id} className="bg-white p-4 mb-4 rounded-lg shadow">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Booking ID</span>
                                <span>{booking.bookingId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{isVendor ? 'Client Name' : 'Company'}</span>
                                <span>{isVendor ? booking.clientName : booking.vendorId.companyName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Starting Date</span>
                                <span>{formatDate(booking.startingDate)}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Payment Status</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-xs">Advance</span>
                                        <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.advancePayment.status)}`}>
                                            {booking.advancePayment.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs">Final</span>
                                        <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.finalPayment.status)}`}>
                                            {booking.finalPayment.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Status</span>
                                <span className={`px-2 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                    {booking.bookingStatus.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-center mt-4">
                                <Button
                                    size="sm"
                                    variant="bordered"
                                    onPress={() => {
                                        setSelectedBooking(booking);
                                        setIsDetailsModalOpen(true);
                                    }}
                                >
                                    View Details
                                </Button>
                            </div>
                            <div className="flex justify-center mt-4">
                                {renderPaymentButton(booking)}
                                {booking.bookingStatus === BookingStatus.Completed && (
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        onPress={() => {
                                            setSelectedBooking(booking);
                                            setIsDetailsModalOpen(true);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center py-4">
                {bookingConfirmed.length > 0 && (
                    <>
                        <Pagination
                            total={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            showControls
                            size="sm"
                            className="gap-2"
                            radius="sm"
                            classNames={{
                                wrapper: "gap-0 overflow-visible h-8",
                                item: "w-8 h-8 text-sm rounded-none",
                                cursor: "bg-black text-white font-bold",
                                next: "bg-transparent hover:bg-default-100",
                                prev: "bg-transparent hover:bg-default-100",
                            }}
                        />
                        <div className="ml-4 text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, bookingConfirmed.length)} of {bookingConfirmed.length} entries
                        </div>
                    </>
                )}
            </div>

            {/* Details Modal */}
            {selectedBooking && (
                <BookingConfirmedDetailsModal
                    isOpen={isDetailsModalOpen}
                    onOpenChange={setIsDetailsModalOpen}
                    booking={selectedBooking}
                />
            )}
        </div>
    );
};
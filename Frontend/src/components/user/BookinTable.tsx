import { Booking, BookingAcceptanceStatus } from "@/validations/user/bookingValidation";
import { Button, Pagination } from "@nextui-org/react";
import { useState } from "react";
import BookingDetailsModal from "../common/BookingRequestDetails";
import Swal from "sweetalert2";
import { axiosInstance } from "@/config/api/axiosInstance";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import PaymentMethodModal from "@/pages/user/bookings/PaymentMethodModal";
import { BookingError, BookingTableProps, PaymentBookingData } from "@/utils/interfaces";
import { convertToPaymentBookingData, getBookingStatusColor } from "@/utils/utils";


export const BookingTable: React.FC<BookingTableProps> = ({

  bookings,
  isVendor = false,
  onCancel,
  onAccept,
  onReject
}) => {
console.log(bookings,'bookingg');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleActionClick = async (
    bookingId: string,
    action: 'cancel' | 'accept' | 'reject',
    errorMessage?: string
  ) => {

    const handleError = async (error: BookingError, action: string) => {
      console.error(`Error ${action}ing booking:`, error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage || `Failed to ${action} booking`,
        confirmButtonText: 'OK'
      });
    };

    const showSuccess = async (action: string) => {
      await Swal.fire({
        icon: 'success',
        title: `${action.charAt(0).toUpperCase() + action.slice(1)}ed!`,
        text: `The booking has been ${action}ed successfully.`,
        confirmButtonText: 'OK'
      });
    };

    try {
      switch (action) {
        case 'reject': {
          if (!onReject) {
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Reject action is not available',
              confirmButtonText: 'OK'
            });
            return;
          }

          const { value: rejectionReason, dismiss } = await Swal.fire({
            title: 'Rejection Reason',
            input: 'textarea',
            inputLabel: 'Please provide a reason for rejection',
            inputPlaceholder: 'Enter your reason here...',
            inputValidator: (value) => {
              if (!value || value.trim() === '') {
                return 'You need to provide a reason for rejection!';
              }
              if (value.length < 10) {
                return 'Please provide a more detailed reason (minimum 10 characters)';
              }
              return null;
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Continue'
          });

          if (dismiss || !rejectionReason) return;

          const confirmResult = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reject this booking?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, reject booking!'
          });

          if (confirmResult.isConfirmed) {
            await onReject(bookingId, rejectionReason);
            await showSuccess('reject');
          }
          break;
        }

        case 'accept':
        case 'cancel': {
          const actionHandler = {
            cancel: onCancel,
            accept: onAccept
          }[action];

          if (!actionHandler) {
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `${action} action is not available`,
              confirmButtonText: 'OK'
            });
            return;
          }

          const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${action} this booking?`,
            icon: action === 'cancel' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: action === 'cancel' ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action} booking!`
          });

          if (result.isConfirmed) {
            await actionHandler(bookingId);
            if (action === 'accept') {
              await showSuccess(action);
            }

          }
          break;
        }

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error) {
      await handleError(error as BookingError, action);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handlePayNow = async (booking: Booking) => {
    setSelectedBookingForPayment(booking);
    setIsPaymentModalOpen(true);
  };

  const processPayment = async (bookingData: PaymentBookingData, paymentMethod: string) => {
    try {
      const originalBooking = bookings.find(b => b._id === bookingData._id);
      if (!originalBooking) {
        throw new Error('Booking not found');
      }
      const vendorId = bookingData.vendor_id?._id || bookingData.vendorId?._id;
      if (!vendorId) {
        showToastMessage("Vendor information is missing", 'error');
        return;
      }


      const response = await axiosInstance.post('/isBookingAccepted', {
        vendorId: vendorId,
        bookingId: bookingData._id
      });

      if (!response.data.success) {
        showToastMessage("Unable to process payment at this time", 'error');
        return;
      }

      const bookingStatus = response.data.result;
      if (bookingStatus.bookingStatus !== BookingAcceptanceStatus.Accepted) {
        showToastMessage("Your request is not accepted yet", 'error');
        return;
      }

      const paymentEndpoint = paymentMethod === 'stripe' ? '/stripe-payment' : '/razorpay-payment';
      const paymentResponse = await axiosInstance.post(paymentEndpoint, {
        companyName: originalBooking.vendor_id.bookedDates,
        bookingData: bookingStatus,
        paymentMethod
      });

      if (paymentResponse.data.success && paymentResponse.data.result.url) {
        window.location.href = paymentResponse.data.result.url;
      } else {
        showToastMessage(paymentResponse.data.message || "Payment URL generation failed", 'error');
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

  const handleResubmitClick = () => {
    Swal.fire({
      title: "Resubmit Application",
      text: "The resubmission feature is currently unavailable. We appreciate your patience and recommend checking back later. For urgent matters, please contact our support team.",
      icon: "info",
      confirmButtonText: "Okay",
      confirmButtonColor: "#000",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 hidden md:table">
        <thead className="bg-gray-50">
          <tr>
            {isVendor ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOOKING ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Function Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOOKING ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Function Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentBookings.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-4 mt-5 text-center text-gray-500">
                {`No bookings available at the moment.`}
                <br />
                {`Please check back later or create a new booking.`}
              </td>
            </tr>


          ) : (
            <>
              {currentBookings.map((booking, index) => (

                <tr key={booking._id}>
                  {isVendor ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingReqId || booking._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-montserrat">
                          {booking.user_id.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.startingDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.noOfDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
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
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        {booking.bookingStatus === 'requested' && (
                          <>
                            <Button
                              size="sm"
                              color="success"
                              onClick={() => handleActionClick(booking._id, 'accept')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleActionClick(booking._id, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </>
                  ) : (
                    <>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingReqId || booking._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-montserrat">
                          {booking.vendor_id.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-montserrat text-gray-500">
                        {booking.vendor_id.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.startingDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.noOfDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
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
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        {booking.bookingStatus === 'requested' && (
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleActionClick(booking._id, 'cancel')}
                          >
                            Revoke
                          </Button>
                        )}
                        {booking.bookingStatus === 'accepted' &&
                          booking.advancePaymentDueDate && booking.advancePayment?.status === 'pending' &&
                          new Date(booking.advancePaymentDueDate) > new Date() && (
                            <Button
                              size="sm"
                              className="bg-custom-button hover:bg-custom-button-hover text-white"
                              onClick={() => handlePayNow(booking)}
                            >
                              Pay Now
                            </Button>
                          )}

                        {booking.bookingStatus === 'rejected' || booking.bookingStatus === 'revoked' && (
                          <Button
                            size="sm"
                            color="default"
                            onClick={handleResubmitClick}
                          >
                            Resubmit
                          </Button>
                        )}
                      </td>

                    </>
                  )}
                </tr>
              ))}
              {selectedBookingForPayment && (
                <PaymentMethodModal
                  isOpen={isPaymentModalOpen}
                  onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedBookingForPayment(null);
                  }}
                  booking={selectedBookingForPayment}
                  onProcessPayment={processPayment}
                />
              )}
              {selectedBooking && (
                <BookingDetailsModal
                  isOpen={isDetailsModalOpen}
                  onOpenChange={setIsDetailsModalOpen}
                  booking={selectedBooking}
                />
              )}
            </>
          )}

        </tbody>
      </table>

      <div className="flex justify-center items-center py-4">
        {bookings.length > 0 && (
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
              Showing {startIndex + 1} to {Math.min(endIndex, bookings.length)} of {bookings.length} entries
            </div>
          </>
        )}

      </div>


      <div className="p-4 md:hidden">
        {currentBookings.map((booking) => (
          <div key={booking._id} className="w-full rounded-md mb-4">
            <div className="flex flex-col w-auto">
              {isVendor ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Request From:</span>
                    <span className="text-gray-700 ms-6">{booking.user_id.name}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Request Status:</span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {booking.bookingStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Total No of Days:</span>
                    <span className="text-gray-700 ms-6">{booking.noOfDays}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Starting Date:</span>
                    <span className="text-gray-700 ms-6">{booking.startingDate}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Company Name:</span>
                    <span className="text-gray-700 ms-6">
                      {booking.vendor_id.companyName}
                    </span>
                  </div>
                  <div className="mt-4">
                    {booking.bookingStatus === 'requested' && (
                      <>
                        <Button
                          className="mr-2"
                          onClick={() => handleActionClick(booking._id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleActionClick(booking._id, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {booking.bookingStatus === 'rejected' && (
                      <Button
                        size="sm"
                        color="default"
                        onClick={handleResubmitClick}
                      >
                        Resubmit
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Request To:</span>
                    <span className="text-gray-700 ms-6">
                      {booking.vendor_id.name}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Request Status:</span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {booking.bookingStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Total No of Days:</span>
                    <span className="text-gray-700 ms-6">{booking.noOfDays}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Starting Date:</span>
                    <span className="text-gray-700 ms-6">{booking.startingDate}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold w-32">Company Name:</span>
                    <span className="text-gray-700 ms-6">
                      {booking.vendor_id.companyName}
                    </span>
                  </div>
                  <div className="mt-4">
                    {booking.bookingStatus === 'requested' && (
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleActionClick(booking._id, 'cancel')}
                      >
                        Revoke
                      </Button>
                    )}
                    {booking.bookingStatus === 'accepted' &&
                      booking.advancePaymentDueDate && booking.advancePayment?.status === 'pending' &&
                      new Date(booking.advancePaymentDueDate) > new Date() && (
                        <Button
                          size="sm"
                          color="primary"
                          onClick={() => handlePayNow(booking)}
                        >
                          Pay Now
                        </Button>
                      )}
                    {selectedBookingForPayment && (
                      <PaymentMethodModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => {
                          setIsPaymentModalOpen(false);
                          setSelectedBookingForPayment(null);
                        }}
                        booking={convertToPaymentBookingData(selectedBookingForPayment)}
                        onProcessPayment={processPayment}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>



    </div>
  );
};
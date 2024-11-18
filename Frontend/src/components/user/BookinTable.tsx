import { Booking, BookingAcceptanceStatus } from "@/validations/user/bookingValidation";
import { Button, Pagination } from "@nextui-org/react";
import { useState } from "react";
import BookingDetailsModal from "../common/BookingRequestDetails";
import Swal from "sweetalert2";

type BookingTableProps = {
  title: string;
  bookings: Booking[];
  isVendor?: boolean;
  onCancel?: (id: string) => Promise<void>;
  onAccept?: (id: string, errorMessage?: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
};


export const BookingTable: React.FC<BookingTableProps> = ({

  bookings,
  isVendor = false,
  onCancel,
  onAccept,
  onReject
}) => {

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusColor = (status: BookingAcceptanceStatus) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const handleActionClick = async (bookingId: string, action: 'cancel' | 'accept' | 'reject', errorMessage?: string) => {
    console.log(errorMessage, 'errormessage');


    if (action === 'reject') {
      if (!onReject) {
        await Swal.fire(
          'Error',
          'Reject action is not available',
          'error'
        );
        return;
      }
      const { value: rejectionReason } = await Swal.fire({
        title: 'Rejection Reason',
        input: 'textarea',
        inputLabel: 'Please provide a reason for rejection',
        inputPlaceholder: 'Enter your reason here...',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to provide a reason for rejection!';
          }
          return null;
        },
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Reject Booking'
      });

      if (!rejectionReason) return;

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
        try {
          // onReject is guaranteed to exist because of the props interface
          await onReject(bookingId, rejectionReason);
          await Swal.fire(
            'Rejected!',
            'The booking has been rejected.',
            'success'
          );
        } catch (error) {
          await Swal.fire(
            'Error',
            errorMessage || 'Failed to reject booking',
            'error'

          );
          console.error('Error rejecting booking:', error);
        }
      }
    } else {


      const actionHandler = {
        cancel: onCancel,
        accept: onAccept,
      }[action];
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${action} this booking?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${action} booking!`
      });

      if (result.isConfirmed && actionHandler) {
        try {
          await actionHandler(bookingId);
          await Swal.fire(
            `${action.charAt(0).toUpperCase() + action.slice(1)}!`,
            `The booking has been ${action}d.`,
            'success'
          );
        } catch (error) {
          await Swal.fire(
            'Error',
            errorMessage || `Failed to ${action} booking`,
            'error'
          );
          console.error('Error cancelling booking:', error);
        }
      }
    }


  };





  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };
  console.log(bookings, 'bbbbbbbbbbbb');

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
            <div>

            </div>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
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
                          booking.advancePaymentDueDate &&
                          new Date(booking.advancePaymentDueDate) > new Date() && (
                            <Button
                              size="sm"
                              color="primary"
                            >
                              Pay Now
                            </Button>
                          )}
                        {booking.bookingStatus === 'rejected' || booking.bookingStatus === 'revoked' && (
                          <Button
                            size="sm"
                            color="default"
                          >
                            Resubmit
                          </Button>
                        )}
                      </td>

                    </>
                  )}
                </tr>
              ))}
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
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
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
                    {booking.bookingStatus === 'accepted' && (
                      <Button
                        size="sm"
                        color="primary"
                      >
                        Pay Now
                      </Button>
                    )}
                    {booking.bookingStatus === 'rejected' && (
                      <Button
                        size="sm"
                        color="default"
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
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
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
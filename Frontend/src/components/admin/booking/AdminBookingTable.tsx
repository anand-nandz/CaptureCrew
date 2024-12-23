import React, { useState } from 'react';
import { Button, Pagination } from "@nextui-org/react";
import { BookingConfirmed } from '@/types/bookingTypes';
import BookingConfirmedDetailsModal from '@/components/common/BookingDetails';
import { formatDate, getPaymentStatusColor, getStatusColor } from '@/utils/utils';

type AdminBookingTableProps = {
  title: string;
  bookings: BookingConfirmed[];
};

export const AdminBookingTable: React.FC<AdminBookingTableProps> = ({
  bookings,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingConfirmed | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

  const calculateTotalReceived = (booking: BookingConfirmed) => {
    return (
      (booking.advancePayment?.status === 'completed' ? booking.advancePayment.amount : 0) +
      (booking.finalPayment?.status === 'completed' ? booking.finalPayment.amount : 0)
    );
  };

  return (
    <div className="overflow-x-auto">
      {/* Desktop View */}
      <table className="min-w-full divide-y divide-gray-200 hidden md:table">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From User</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Vendor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date and Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Dates</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Done</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentBookings.map((booking, index) => (
            <tr key={booking._id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {booking.bookingId || booking._id}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{booking.userId.name}</div>
                <div className="text-sm text-gray-500">{booking.userId.email}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{booking.vendorId.name}</div>
                <div className="text-sm text-gray-500">{booking.vendorId.companyName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="space-y-1">
                  <div>
                    {booking.startingDate}
                  </div>
                  <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                    {booking.bookingStatus.toUpperCase()}
                  </div>
                </div>

              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div>
                    <span className="text-xs font-medium">Adv: </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.advancePayment?.status ?? 'not_paid')}`}>
                      {booking.advancePayment?.status.toUpperCase() ?? 'NOT PAID'}
                    </span>
                  </div>
                  {booking.advancePayment.status !== 'refunded' && (
                    <div>
                      <span className="text-xs font-medium">Final: </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.finalPayment?.status ?? 'not_paid')}`}>
                        {booking.finalPayment?.status.toUpperCase() ?? 'NOT PAID'}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <div className="space-y-1">
                  {booking.advancePayment.status !== 'refunded' ? (
                    <div>
                      {booking.finalPayment?.status === 'completed' ? (
                        <div>
                          <span className="font-medium text-xs">Final: </span>
                          <span className="text-green-500 font-semibold text-xs flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Paid
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-xs">Final Due: </span>
                          {booking.finalPayment && new Date(booking.finalPayment.dueDate) < new Date() ? (
                            <span className="text-red-500 font-semibold text-xs">Overdue</span>
                          ) : (
                            <span className="text-xs">{booking.finalPayment ? formatDate(booking.finalPayment.dueDate) : 'N/A'}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">Due: </span>
                      {`N/A`}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {`₹${calculateTotalReceived(booking)} / ₹${booking.totalAmount}`}
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.advancePayment?.status ?? 'N/A')} `}>
                  {`${((calculateTotalReceived(booking) / booking.totalAmount) * 100).toFixed(0)}% Paid`}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {currentBookings.map((booking, index) => (
          <div key={booking._id} className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium">Booking #{startIndex + index + 1}</div>
                  <div className="text-xs text-gray-500">{booking.bookingId}</div>
                </div>
                <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">From:</span> {booking.userId.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">To:</span> {booking.vendorId.companyName}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Date:</span> {formatDate(booking.startingDate)}
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
              </div>

              <Button
                size="sm"
                variant="bordered"
                className="w-full mt-2"
                onPress={() => {
                  setSelectedBooking(booking);
                  setIsDetailsModalOpen(true);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center py-4">
        {bookings.length > 0 && (
          <>
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={(page) => setCurrentPage(page)}
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

      {/* Details Modal */}
      {selectedBooking && (
        <BookingConfirmedDetailsModal
          isOpen={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          booking={selectedBooking as BookingConfirmed}
        />
      )}
    </div>
  );
};

export default AdminBookingTable;
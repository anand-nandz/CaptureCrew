import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  ScrollShadow,
} from "@nextui-org/react";
import { Calendar, MapPin, Package, Phone, Mail, User, Clock, Building, CreditCard, DownloadIcon } from 'lucide-react';
import { Transaction } from "@/types/extraTypes";
import { BookingConfirmedDetailsModalProps, ExtendedPaymentDetails } from "@/utils/interfaces";
import { generateBookingPDF } from "@/utils/generateBookingPDF";
import { getStatusColor } from "@/utils/utils";


const BookingConfirmedDetailsModal: React.FC<BookingConfirmedDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  booking
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleDownload = () => {
    generateBookingPDF(booking);
  };

  const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );

  const PaymentCard: React.FC<{
    title: string;
    payment: ExtendedPaymentDetails;
    transactions?: Transaction[];
    bookingId?: string;
  }> = ({ title, payment, transactions, bookingId }) => {

    const refundTransaction = transactions?.find(
      transaction =>
        transaction.bookingId === bookingId &&
        transaction.paymentType === 'refund' &&
        transaction.status === 'completed'
    );
    return (
      <Card className="mb-4 shadow-md">
        <CardBody className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Chip
              color={payment.status === 'completed' ? 'success' : payment.status === 'refunded' ? 'warning' : payment.status === 'failed' ? 'danger' : 'default'}
              variant="flat"
            >
              {payment.status.toUpperCase()}
            </Chip>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {payment.dueDate && payment.status !== 'completed' && (
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={20} />
                <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {payment.paidAt && payment.status === 'completed' && (
              <div className="flex items-center gap-2">
                <Clock className="text-gray-500" size={20} />
                <span>Paid: {new Date(payment.paidAt).toLocaleDateString()}</span>
              </div>
            )}

            {payment.refundedAt && payment.status === 'refunded' && (
              <div className="flex items-center gap-2">
                <Clock className="text-gray-500" size={20} />
                <span>Refunded On: {new Date(payment.refundedAt).toLocaleDateString()}</span>
              </div>
            )}

            {payment.status !== 'refunded' ? (
              <div className="flex items-center gap-2">
                <CreditCard className="text-gray-500" size={20} />
                <span>{formatPrice(payment.amount)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="text-gray-500" size={20} />
                <span>
                  {refundTransaction
                    ? formatPrice(refundTransaction.amount)
                    : formatPrice(payment.amount)
                  }
                </span>
              </div>
            )}

          </div>

          {payment.paymentId && payment.status !== 'refunded' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Payment ID:</span>
              <span className="text-sm font-mono">
                ...{payment.paymentId.slice(-10)}
              </span>
            </div>
          )}

        </CardBody>
      </Card>
    )
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-4">
              <div className="flex items-start justify-between p-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">Confirmed Booking Details</h2>
                  <p className="text-sm text-gray-500">Booking ID: {booking.bookingId}</p>
                </div>
                <Button
                  onClick={handleDownload}
                  type="button"
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[calc(80vh-100px)]">
                <div className="space-y-6 p-1">
                  {/* Status and Creation Date */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div
                      className={`px-4 py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {`BOOKING ${booking.bookingStatus.toUpperCase()}`}
                    </div>
                    <p className="text-sm text-gray-500">
                      Created on: {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>


                  {/* Payment Section */}
                  <Card>
                    <CardBody>

                      <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
                      <PaymentCard
                        title="Advance Payment"
                        payment={booking.advancePayment}
                        transactions={booking.userId.transactions}
                        bookingId={booking.bookingId}

                      />
                      {booking.advancePayment.status !== 'refunded' && (
                        <>
                          <PaymentCard
                            title="Final Payment"
                            payment={{ ...booking.finalPayment }}

                          />


                          <Divider className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total Amount:</span>
                            <span className="text-xl font-bold">{formatPrice(booking.totalAmount)}</span>
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={User} label="Name" value={booking.clientName} />
                        <InfoItem icon={Mail} label="Email" value={booking.email} />
                        <InfoItem icon={Phone} label="Phone" value={booking.phone} />
                        <InfoItem icon={MapPin} label="Venue" value={booking.venue} />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Event Details */}
                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Package} label="Service Type" value={booking.serviceType} />
                        <InfoItem icon={Calendar} label="Starting Date" value={booking.startingDate} />
                        <InfoItem icon={Clock} label="Duration" value={`${booking.noOfDays} day(s)`} />
                        {booking.requestedDates.length > 0 && (
                          <div className="col-span-2">
                            <h4 className="text-sm text-gray-500 mb-2">Requested Dates:</h4>
                            <div className="flex flex-wrap gap-2">
                              {booking.requestedDates.map((date, index) => (
                                <Chip key={index} size="sm">
                                  {date}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Vendor Information */}
                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Building} label="Company" value={booking.vendorId.companyName} />
                        <InfoItem icon={User} label="Vendor Name" value={booking.vendorId.name} />
                        <InfoItem icon={MapPin} label="City" value={booking.vendorId.city} />
                        <InfoItem icon={Phone} label="Contact" value={booking.vendorId.contactinfo} />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Package Details */}
                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-2">Package Details</h3>
                      <p className="text-gray-600 mb-2">{booking.packageId.description}</p>
                      <p className="text-gray-600 mb-2">Photographers: {booking.packageId.photographerCount}</p>
                      <p className="text-gray-600 mb-2">Base Package Price: {formatPrice(booking.packageId.price)}</p>
                      <Divider className="my-2" />
                      <h4 className="text-md font-semibold mb-2">Features:</h4>
                      <ul className="list-disc list-inside">
                        {booking.packageId.features.map((feature, index) => (
                          <li key={index} className="text-gray-600">{feature}</li>
                        ))}
                      </ul>
                      {/* {booking.customizations.length > 0 && (
                        <>
                          <Divider className="my-2" />
                          <h4 className="text-md font-semibold mb-2">Selected Customizations:</h4>
                          <ul className="list-disc list-inside">
                            {booking.customizations.map((customization, index) => (
                              <li key={index} className="text-gray-600">{customization}</li>
                            ))}
                          </ul>
                        </>
                      )} */}
                    </CardBody>
                  </Card>
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingConfirmedDetailsModal;    
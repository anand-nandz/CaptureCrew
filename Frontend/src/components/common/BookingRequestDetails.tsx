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
import { Calendar, MapPin, Package, Phone, Mail, User, Clock, Building, MessageSquare } from 'lucide-react';
import { CustomizationOption } from "@/types/packageTypes";
import PriceBreakdown from "./PriceBreakdown";
import { PaymentDetails } from "@/validations/user/bookingValidation";
import { FaMoneyBill } from "react-icons/fa";
import { formatDate } from "@/utils/userUtils";

export interface BookingDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    venue: string;
    serviceType: string;
    startingDate: string;
    totalPrice: number;
    noOfDays: number;
    message: string;
    bookingStatus: string;
    bookingReqId?: string;
    rejectionReason?: string;
    packageId: {
      price?: number;
      description: string;
      photographerCount: number;
      features: string[];
      customizationOptions: CustomizationOption[]
    };
    vendor_id: {
      name: string;
      companyName: string;
      city: string;
      contactinfo: string;
    };
    customizations: string[];
    advancePaymentDueDate?: string; 
    advancePayment?: PaymentDetails;
    createdAt: string;
  };
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onOpenChange, booking }) => {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'requested': return "warning";
      case `pending`: return "warning";
      case 'accepted': return "success";
      case 'rejected': return "danger";
      case 'overdue': return "danger";
      case 'revoked': return "default";
      default: return "default";
    }
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
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <p className="text-sm text-gray-500">Booking ID: {booking.bookingReqId ?? booking._id}</p>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[calc(80vh-200px)]">
                <div className="space-y-6 p-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Chip color={getStatusColor(booking.bookingStatus)} variant="flat" size="lg">
                      {booking.bookingStatus.toUpperCase()}
                    </Chip>
                    <p className="text-sm text-gray-500">Created on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>

                  {booking.bookingStatus.toLowerCase() === 'rejected' && (
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-semibold mb-2">Reason For Rejection</h3>
                        <p className="text-gray-600">{booking.rejectionReason}</p>
                      </CardBody>
                    </Card>
                  )}

                  {booking.bookingStatus.toLowerCase() === 'overdue' && (
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-semibold mb-2">Payment Overdue</h3>
                        <p className="text-gray-600">{`Your payment is overdue on ${formatDate(booking.advancePaymentDueDate)}. Plaease do conatct the vendor for more.`}</p>
                      </CardBody>
                    </Card>
                  )}

                  {booking.bookingStatus.toLowerCase() === 'accepted' && booking.bookingStatus.toLowerCase() === 'overdue' && booking.advancePaymentDueDate && booking.advancePayment && (
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-semibold mb-2">{booking.bookingStatus.toLowerCase() === 'overdue' ? 'Payment Overdue' : 'Payment Details'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoItem icon={FaMoneyBill} label="Due Date" value={new Date(booking.advancePaymentDueDate).toLocaleDateString() ?? 'N/A'} />
                          <InfoItem icon={FaMoneyBill} label="Amount" value={`₹ ${booking.advancePayment?.amount.toString() ?? 'N/A'}`} />
                          <Chip color={getStatusColor(booking.advancePayment.status)} variant="flat" size="lg">
                            {booking.advancePayment.status.toUpperCase()}
                          </Chip>
                          {booking.advancePayment.status === 'completed' && booking.advancePayment.paidAt && (
                            <InfoItem icon={FaMoneyBill} label="Paid At" value={booking.advancePayment.paidAt ?? 'N/A'} />
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={User} label="Name" value={booking.name} />
                        <InfoItem icon={Mail} label="Email" value={booking.email} />
                        <InfoItem icon={Phone} label="Phone" value={booking.phone} />
                        <InfoItem icon={MapPin} label="Venue" value={booking.venue} />
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Package} label="Service Type" value={booking.serviceType} />
                        <InfoItem icon={Calendar} label="Starting Date" value={booking.startingDate} />
                        <InfoItem icon={Clock} label="Duration" value={`${booking.noOfDays} day(s)`} />
                        {booking.customizations && booking.customizations.length > 0 ? (
                          <PriceBreakdown booking={booking} />
                        ) : (
                         <>
                          <PriceBreakdown booking={booking} />
                         </>
                        )}

                        {/* <div className="flex items-center">
                          <InfoItem
                            icon={CreditCard}
                            label="Total Booking Price"
                            value={booking.totalPrice !== undefined ? formatPrice(booking.totalPrice) : "N/A"}
                          />
                          <Popover placement="right">
                            <PopoverTrigger>
                              <button className="ml-2 p-1 hover:bg-gray-100 rounded-full">
                                <Info className="w-4 h-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="px-1 py-2">
                                <div className="text-small font-bold">Pricing Breakdown</div>
                                <div className="text-tiny">{'fgdfgdfgfdg'}</div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div> */}
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Building} label="Company" value={booking.vendor_id.companyName} />
                        <InfoItem icon={User} label="Vendor Name" value={booking.vendor_id.name} />
                        <InfoItem icon={MapPin} label="City" value={booking.vendor_id.city} />
                        <InfoItem icon={Phone} label="Contact" value={booking.vendor_id.contactinfo} />
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h3 className="text-lg font-semibold mb-2">Package Details</h3>
                      <p className="text-gray-600 mb-2">{booking.packageId.description}</p>
                      <p className="text-gray-600 mb-2">Photographers: {booking.packageId.photographerCount}</p>
                      <p className="text-gray-600 mb-2">Package Amount: ₹{booking.packageId.price}</p>
                      <Divider className="my-2" />
                      <h4 className="text-md font-semibold mb-2">Features:</h4>
                      <ul className="list-disc list-inside">
                        {booking.packageId.features.map((feature, index) => (
                          <li key={index} className="text-gray-600">{feature}</li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                          <p className="text-gray-600">{booking.message}</p>
                        </div>
                      </div>
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

export default BookingDetailsModal;
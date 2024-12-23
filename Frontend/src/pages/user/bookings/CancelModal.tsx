import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Card, CardBody, Tooltip, Textarea, Spinner } from "@nextui-org/react";
import { AlertCircle, InfoIcon, ClockIcon, WalletIcon, CalendarCheckIcon } from "lucide-react";
import { BookingCancellationPolicyImpl } from '@/utils/bookingPolicyService';
import { CancelModalProps } from '@/utils/interfaces';

const CancelModal = ({ isOpen, onClose, booking, onProcessPayment, isCancelling}: CancelModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundEligibility, setRefundEligibility] = useState<{
    isEligible: boolean;
    userRefundPercentage: number;
    vendorFeePercentage: number;
    daysRemainingBeforeEvent?: number;
    reason?: string;
    
  }>();

  useEffect(() => {
    const policy = new BookingCancellationPolicyImpl();
    const eligibility = policy.calculateRefundEligibility(booking);
    setRefundEligibility(eligibility);
  }, [booking]);

  const calculateRefundAmount = () => {
    if (refundEligibility) {
      const userRefund =
        booking.advancePayment.amount * (refundEligibility.userRefundPercentage / 100);
      const vendorAmount =
        booking.advancePayment.amount * (refundEligibility.vendorFeePercentage / 100);

      return { userRefund, vendorAmount };
    }
    return { userRefund: 0, vendorAmount: 0 };
  };
  const validateReason = () => {
    return cancellationReason.trim().length >= 10;
  };

  const handleCancelBooking = async () => {
    try {
      if (!validateReason()) {
        setError('Please provide a detailed cancellation reason (minimum 10 characters).');
        return;
      }
      setIsProcessing(true);
      setError(null);

      if (!refundEligibility?.isEligible) {
        throw new Error(refundEligibility?.reason || 'Cancellation not permitted');
      }

      await onProcessPayment(booking, cancellationReason);
      onClose();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to process cancellation. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const { userRefund } = calculateRefundAmount();

  const cancellationPolicyDetails = [
    {
      timeframe: 'Early Cancellation (First 10% of time)',
      refund: '95% Refund',
      fee: '5% Vendor Fee'
    },
    {
      timeframe: 'Partial Refund Period (Up to 60% of time)',
      refund: '70% Refund',
      fee: '30% Vendor Fee'
    },
    {
      timeframe: 'Late Cancellation (Beyond 60% of time)',
      refund: 'No Refund',
      fee: 'Full Vendor Retention'
    }
  ];

  // Cancellation fee details
  const cancellationFeeDetails = {
    5: 'Minimal fee for early cancellation',
    30: 'Standard cancellation fee for later changes'
  };

  const cancellationFeeText =
    refundEligibility?.vendorFeePercentage === 30
      ? '30% cancellation fee applies'
      : '5% cancellation fee applies';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        body: "py-6 ",
        base: "bg-white dark:bg-gray-900"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
          <span>Cancel Booking</span>
          <p className="text-sm text-gray-500 font-normal">Review your cancellation details</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Booking Details Card */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-2">
                  <CalendarCheckIcon size={20} className="text-black" />
                  <p className="font-medium text-lg">Booking Information</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-semibold">{booking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Event Date</p>
                    <p className="font-semibold">{booking.startingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Until Event</p>
                    <p className="font-semibold flex items-center gap-1">
                      <ClockIcon size={16} />
                      {refundEligibility?.daysRemainingBeforeEvent ?? 0} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-semibold flex items-center gap-1">
                      <WalletIcon size={16} />
                      ₹ {booking.advancePayment.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Refund Details Card */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-2">
                  <InfoIcon size={20} className="text-black" />
                  <p className="font-medium text-lg">Refund Details</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p>Refund Amount</p>
                    <p
                      className={
                        refundEligibility?.isEligible
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600'
                      }
                    >
                      ₹ {userRefund.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p>Cancellation Fee</p>
                      <Tooltip
                        content={
                          cancellationFeeDetails[
                          refundEligibility?.vendorFeePercentage === 30 ? 30 : 5
                          ]
                        }
                      >
                        <InfoIcon size={16} className="text-gray-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500">
                      {cancellationFeeText}
                    </p>
                  </div>
                  {refundEligibility?.reason && (
                    <p className="text-sm italic text-gray-600 bg-blue-50 p-2 rounded">
                      <InfoIcon size={16} className="inline-block mr-2" />
                      {refundEligibility.reason}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-2">
                  <InfoIcon size={20} className="text-black" />
                  <p className="font-medium text-lg">Cancellation Policy</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Timeframe</th>
                      <th className="p-2 text-left">Refund</th>
                      <th className="p-2 text-left">Vendor Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancellationPolicyDetails.map((policy, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{policy.timeframe}</td>
                        <td className="p-2">{policy.refund}</td>
                        <td className="p-2">{policy.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>

            <div>
              <Textarea
                label="Cancellation Reason"
                placeholder="Please provide a detailed reason for cancellation (minimum 10 characters)"
                value={cancellationReason}
                onValueChange={setCancellationReason}
                minRows={3}
                maxRows={5}
                variant="bordered"
                isInvalid={cancellationReason.trim().length > 0 && cancellationReason.trim().length < 10}
                errorMessage={cancellationReason.trim().length > 0 && cancellationReason.trim().length < 10 ? 'Reason must be at least 10 characters long' : ''}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                className="flex-1"
                color="danger"
                onClick={handleCancelBooking}
                isDisabled={isCancelling  || isProcessing || !refundEligibility?.isEligible || !validateReason()}
              >
                {isCancelling  ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
              <Button
                className="flex-1"
                color="default"
                variant="bordered"
                onClick={onClose}
                isDisabled={isCancelling || isProcessing}
              >
                Go Back
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CancelModal;
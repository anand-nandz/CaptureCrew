import React, { useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    RadioGroup,
    Radio,
    Card,
    CardBody,
    Divider,
    Chip
} from "@nextui-org/react";
import { CreditCard, Wallet, Shield, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface PaymentBookingData {
    _id: string;
    bookingReqId?: string;
    bookingId?: string;
    vendor_id?: {
      companyName: string;
      _id: string;
    };
    vendorId?: {
      companyName: string;
      _id: string;
    };
    advancePayment?: {
      amount: number;
      status: string;
    };
    finalPayment?: {
      amount: number;
      status: string;
    };
    
}

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: PaymentBookingData;
    isConfirmed?: boolean
    onProcessPayment: (booking: PaymentBookingData, paymentMethod: string) => Promise<void>;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    isOpen,
    onClose,
    booking,
    isConfirmed = false,
    onProcessPayment
}) => {
    const [selectedMethod, setSelectedMethod] = useState("stripe");
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePaymentProcess = async () => {
        setIsProcessing(true);
        try {
            await onProcessPayment(booking, selectedMethod);
        } catch (error) {
            console.error('Payment processing error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut"
                        }
                    },
                    exit: {
                        y: -20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn"
                        }
                    }
                }
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Complete Your Payment</h2>
                    <p className="text-sm text-gray-500">Choose your preferred payment method</p>
                </ModalHeader>
                <ModalBody>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        <RadioGroup
                            value={selectedMethod}
                            onValueChange={setSelectedMethod}
                            className="gap-4"
                        >
                            <motion.div variants={fadeIn} className="space-y-4 flex">
                            <div className="grid grid-cols-2 space-x-4 gap-4">
                                    <Radio
                                        value="stripe"
                                        className="border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                        description={
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Shield className="w-4 h-4" />
                                                <span>Secured by Stripe's encryption</span>
                                            </div>
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-tr from-blue-500 to-blue-600 p-2 rounded-lg">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-lg">Credit/Debit Card</span>
                                                <p className="text-sm text-gray-500">All major cards accepted</p>
                                            </div>
                                        </div>
                                    </Radio>

                                    <Radio
                                        value="razorpay"
                                        className="border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                        description={
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Shield className="w-4 h-4" />
                                                <span>UPI, Netbanking & more</span>
                                            </div>
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-tr from-purple-500 to-purple-600 p-2 rounded-lg">
                                                <Wallet className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-lg">Razorpay</span>
                                                <p className="text-sm text-gray-500">Quick payment options</p>
                                            </div>
                                        </div>
                                    </Radio>
                                </div>
                            </motion.div>
                        </RadioGroup>

                        <Divider className="my-4" />

                        <motion.div variants={fadeIn}>
                            <Card className="bg-gray-50">
                                <CardBody className="gap-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-semibold">Payment Summary</span>
                                        <Chip color="primary" variant="flat" size="sm">Secure Payment</Chip>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Booking ID</span>
                                            <span className="font-medium">{isConfirmed ? booking?.bookingId : booking?.bookingReqId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Company</span>
                                            <span className="font-medium">{isConfirmed ? booking?.vendorId?.companyName : booking?.vendor_id?.companyName}</span>
                                        </div>
                                        <Divider className="my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Amount to Pay</span>
                                          
                                            <span className="text-xl font-bold text-black">
                                            {isConfirmed ? `₹ ${booking?.finalPayment?.amount || 0 }`: `₹ ${booking?.advancePayment?.amount || 0}` } 
                                            </span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="bg-slate-100 p-3 rounded-lg mt-4 flex items-center gap-2 text-sm text-black">
                                <AlertCircle className="w-4 h-4" />
                                <span>Your payment is protected by our secure payment gateway</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="bordered"
                        onPress={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onPress={handlePaymentProcess}
                        isLoading={isProcessing}
                        className="bg-gradient-to-r from-black/20 to-black/80"
                        endContent={!isProcessing && <ArrowRight className="w-4 h-4" />}
                    >
                        {isProcessing ? 'Processing...' : `${isConfirmed ? `₹ ${booking?.finalPayment?.amount || 0 }`: `₹ ${booking?.advancePayment?.amount || 0}` } `}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PaymentMethodModal;










// import React, { useState } from 'react';
// import {
//     Modal,
//     ModalContent,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     Button,
//     RadioGroup,
//     Radio
// } from "@nextui-org/react";
// import { CreditCard, Wallet } from "lucide-react";
// import { Booking } from '@/validations/user/bookingValidation';

// interface PaymentMethodModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     booking: Booking;
//     onProcessPayment: (booking: Booking, paymentMethod: string) => Promise<void>;

// }

// const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
//     isOpen,
//     onClose,
//     booking,
//     onProcessPayment
// }) => {
//     const [selectedMethod, setSelectedMethod] = useState("stripe");
//     const [isProcessing, setIsProcessing] = useState(false);

//     const handlePaymentProcess = async () => {
//         setIsProcessing(true);
//         try {
//             await onProcessPayment(booking, selectedMethod);
//         } catch (error) {
//             console.error('Payment processing error:', error);
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     return (
//         <Modal
//             isOpen={isOpen}
//             onClose={onClose}
//             size="md"
//         >
//             <ModalContent>
//                 <ModalHeader className="flex flex-col gap-1">
//                     Select Payment Method
//                 </ModalHeader>
//                 <ModalBody>
//                     <RadioGroup
//                         value={selectedMethod}
//                         onValueChange={setSelectedMethod}
//                         className="gap-4"
//                     >
//                         <div className="flex flex-col gap-6">
//                             <Radio
//                                 value="stripe"
//                                 className="border p-4 rounded-lg hover:bg-gray-50"
//                                 description="Pay securely with credit/debit card"
//                             >
//                                 <div className="flex items-center gap-2">
//                                     <CreditCard className="w-5 h-5" />
//                                     <span className="font-medium">Stripe</span>
//                                 </div>
//                             </Radio>

//                             <Radio
//                                 value="razorpay"
//                                 className="border p-4 rounded-lg hover:bg-gray-50"
//                                 description="Quick payment with Razorpay"
//                             >
//                                 <div className="flex items-center gap-2">
//                                     <Wallet className="w-5 h-5" />
//                                     <span className="font-medium">Razorpay</span>
//                                 </div>
//                             </Radio>
//                         </div>
//                     </RadioGroup>

//                     <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                         <h4 className="font-medium mb-2">Payment Summary</h4>
//                         <div className="flex justify-between text-sm">
//                             <span>Booking ID:</span>
//                             <span>{booking?.bookingReqId || booking?._id}</span>
//                         </div>
//                         <div className="flex justify-between text-sm mt-1">
//                             <span>Company:</span>
//                             <span>{booking?.vendor_id?.companyName}</span>
//                         </div>
//                         <div className="flex justify-between font-medium mt-2">
//                             <span>Amount to Pay:</span>
//                             <span>₹{booking?.advancePayment?.amount || 0}</span>
//                         </div>
//                     </div>
//                 </ModalBody>
//                 <ModalFooter>
//                     <Button
//                         variant="bordered"
//                         onPress={onClose}
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         color="primary"
//                         onPress={handlePaymentProcess}
//                         isLoading={isProcessing}
//                     >
//                         Proceed to Pay
//                     </Button>
//                 </ModalFooter>
//             </ModalContent>
//         </Modal>
//     );
// };

// export default PaymentMethodModal;
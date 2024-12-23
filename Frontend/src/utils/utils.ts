import { PaymentStatus, BookingStatus } from "@/types/bookingTypes";
import { styled } from '@mui/system';
import { 
    Card, 
    LinearProgress,
    createTheme,
  } from '@mui/material';
import { Booking, BookingAcceptanceStatus } from "@/validations/user/bookingValidation";
import { PaymentBookingData } from "./interfaces";

export const getStatusColor = (status: string) => {
    switch (status) {
        case BookingStatus.Confirmed:
            return 'bg-blue-100 text-blue-800';
        case 'ongoing':
            return 'bg-yellow-100 text-yellow-800';
        case BookingStatus.Completed:
            return 'bg-green-100 text-green-800';
        case BookingStatus.Cancelled:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case PaymentStatus.Completed:
            return 'bg-green-100 text-green-800';
        case PaymentStatus.Pending:
            return 'bg-yellow-100 text-yellow-800';
        case PaymentStatus.Failed:
            return 'bg-red-100 text-red-800';
        case PaymentStatus.Refund:
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export type Mode = 'block' | 'unblock';


export const getBookingStatusColor = (status: BookingAcceptanceStatus) => {
    switch (status) {
      case BookingAcceptanceStatus.Requested:
        return 'bg-yellow-100 text-yellow-800';
      case BookingAcceptanceStatus.Accepted:
        return 'bg-green-100 text-green-800';
      case BookingAcceptanceStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case BookingAcceptanceStatus.PaymentOverdue:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



export const getCategories = (date: string) => {
    const currentYear = new Date().getFullYear();

    if (date === "month") {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    } else if (date === "week") {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    } else {
        return Array.from({ length: 5 }, (_, index) => `${currentYear - 4 + index}`);
    }
}


export const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

export const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  [`&.MuiLinearProgress-colorPrimary`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 700],
  },
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
  },
}));

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});


export const convertToPaymentBookingData = (booking: Booking): PaymentBookingData => {
    return {
      _id: booking._id,
      bookingReqId: booking.bookingReqId,
      vendor_id: booking.vendor_id ? {
        companyName: booking.vendor_id.companyName,
        _id: booking.vendor_id._id
      } : undefined,
      vendorId: booking.vendor_id ? {
        companyName: booking.vendor_id.companyName,
        _id: booking.vendor_id._id
      } : undefined,
      advancePayment: {
        amount: booking.advancePayment?.amount || 0,
        status: booking.advancePayment?.status || 'pending'
      },
    }
  };


  export const CATEGORIES = [
    {
      title: 'Photographers',
      image: '/images/cate1.jpg',
      description: 'Capture your special moments with our talented photographers. From weddings to corporate events, we have the perfect professionals.',
    },
    {
      title: 'Event Planners',
      image: '/images/cate2.jpg',
      description: 'Let our experienced event planners take care of every detail. From concept to execution, we will make your event unforgettable.',
    },
  ];

  
export const services = [
  {
    title: 'WEDDING',
    image: '/images/event1.jpg',
    description: 'Love seems the swiftest but it is the slowest of all growths. No man or woman really knows what perfect love is until they have been married a quarter of a century.',
  },
  {
    title: 'ENGAGEMENT',
    image: '/images/event2.jpg',
    description: 'When you realize you want to spend the rest of your life with somebody, you want the rest of your life to start as soon as possible.',
  },
  {
    title: 'OUTDOOR',
    image: '/images/event3.jpg',
    description: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking."
  },
];


export const ReportReasons = [
  { key: 'Inappropriate Content', label: 'Inappropriate Content' },
  { key: 'Spam', label: 'Spam' },
  { key: 'Misleading Information', label: 'Misleading Information' },
  { key: 'Harassment', label: 'Harassment' },
  { key: 'Copyright Infringement', label: 'Copyright Infringement' },
  { key: 'Other', label: 'Other' }
];

export const VendorReportReasons = [
    { key: 'Fraudulent Activity', label: 'Fraudulent Activity' },
    { key: 'Poor Customer Service', label: 'Poor Customer Service' },
    { key: 'Unresponsive to Communication', label: 'Unresponsive to Communication' },
    { key: 'Violation of Terms of Service', label: 'Violation of Terms of Service' },
    { key: 'Unethical Business Practices', label: 'Unethical Business Practices' },
    { key: 'Other', label: 'Other' }
  ];
  

  export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };



  
import { BookingConfirmed, PaymentDetails } from "@/types/bookingTypes";
import { VendorReview } from "@/types/extraTypes";
import { Package, PackageData } from "@/types/packageTypes";
import { ServiceProvided } from "@/types/postTypes";
import { UserData } from "@/types/userTypes";
import { VendorData } from "@/types/vendorTypes";
import { Booking } from "@/validations/user/bookingValidation";
import { AxiosInstance } from 'axios';
import { Role } from "./enums";

export interface Review {
  _id: string;
  bookingId: string;
  rating: number;
  content: string;
  userId?: string;
  vendorId?: string;
  reply?: Array<string>;
  createdAt?: string;
  updatedAt?: string;
};


export type ExistingReviewsMap = Record<string, Review | null>;

export interface ResetFormValues {
  password: string;
  confirmPassword: string;
}


export interface IUserDetails {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSave: (data: FormData) => Promise<void>

}
export interface IProfileFormData {
  name: string;
  email: string;
  contactinfo: string;
  image?: File | string;
  isGoogleUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IValidationErrors {
  name: string;
  contactinfo: string;
};

export interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingConfirmed;
  onProcessPayment: (booking: BookingConfirmed, reason: string) => Promise<void>;
  isCancelling?: boolean;
}

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

export interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PaymentBookingData;
  isConfirmed?: boolean
  onProcessPayment: (booking: PaymentBookingData, paymentMethod: string) => Promise<void>;
};


export interface UnifiedCalendarProps {
  isVendor?: boolean;
  vendorDetails?: VendorData | null;
  packages?: Package[];
  axiosInstance: AxiosInstance;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  venue: string;
  serviceType: ServiceProvided | '';
  noOfDays: number;
  packageId: string;
  totalPrice: number;
  message: string;
  selectedDate: string;
  customizations: string[];
};


export interface CustomizationOption {
  type: string;
  description: string;
  price: number;
  unit?: string;
}

export interface CustomizationErrors {
  type?: string;
  description?: string;
  price?: string;
  unit?: string;
}

export interface CustomizationFormProps {
  options: CustomizationOption[];
  onChange: (options: CustomizationOption[]) => void;
  errors?: {
    customizationOptions?: string;
    optionErrors?: CustomizationErrors[];
  };
};

export interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
};

export interface ReviewStatsCardProps {
  totalReviews: number;
  averageRating: number;
  ratingsBreakdown: { [key: number]: number };
};

export interface ServicePackageProps {
  packages: PackageData[];
}

export type BookingConfirmedTableProps = {
  title: string;
  bookingConfirmed: BookingConfirmed[];
  isVendor?: boolean;
  onBookingCancelled?: (bookingId: string) => void;
  onPayNow?: (bookingId: string, sbooking: PaymentBookingData, paymentType: 'finalAmount') => void;
  onBookingUpdate?: (booking: BookingConfirmed) => void;
};

export interface ValidationError {
  inner?: Array<{ path: string; message: string }>;
}

export interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingForm: BookingFormData;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onSubmit: (e: React.FormEvent, formData?: BookingFormData) => Promise<void>;
  selectedDate: string;
  packages: Package[];
  unavailableDates: string[];
  onDateSelect: (date: Date) => void;
};

export type BookingTableProps = {
  title: string;
  bookings: Booking[];
  isVendor?: boolean;
  onCancel?: (id: string) => Promise<void>;
  onAccept?: (id: string, errorMessage?: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
};
export interface BookingError extends Error {
  code?: string;
  details?: string;
}

export interface CarouselNavigationProps {
  setActiveIndex: (index: number) => void;
  activeIndex: number;
  length: number;
}

export interface CarouselArrowProps {
  handlePrev?: () => void;
  handleNext?: () => void;
};


export interface BookingConfirmedDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingConfirmed;
}

export type ExtendedPaymentDetails = PaymentDetails & {
  dueDate?: string;
};

export interface CreditCardsProps {
  accountDetails?: {
    name?: string;
    walletBalance?: number;
    contactinfo?: string;
  };
  type?: 'user' | 'vendor';
};


export interface ReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReportSubmit: (reportData: {
    reason: string;
    additionalDetails?: string;
  }) => Promise<void>;
  type: string
};

export interface ReviewModelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewUpdate: (bookingId: string, review: Review) => void;
  bookingDetails: {
    vendorId: string;
    bookingId: string;
    bookingNumber?: string;
    existingReview?: { _id: string; rating: number; content: string } | null;
  }
};


export interface VendorProps {
  isVendor?: boolean,
  vendorDetails: VendorData | null;
};

export interface IFormValues {
  email: string;
  password: string;
};

export interface AddEditPackageProps {
  isEditMode?: boolean;
  existingPackage?: PackageData | null;
  onClose?: () => void;
  onPackageUpdated?: () => void;
};


export interface VendorDetails {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorData | null;
  onSave: (data: FormData) => Promise<void>

}
export interface ProfileFormData {
  name: string;
  email: string;
  contactinfo: string;
  companyName: string;
  city: string;
  about: string;
  isVerified: boolean;
  logo: string;
  imageUrl?: File | string;
  bookedDates: Array<string>;
  totalRating: number;
  createdAt?: string;
  updatedAt?: string;
}


export interface ValidationErrors {
  name: string;
  contactinfo: string;
  companyName: string;
  city: string,
  about: string,
}

export interface AutoTableOptions {
  startY?: number;
  head: string[][];
  body: string[][];
  theme?: string;
  headStyles?: {
    fillColor?: [number, number, number];
    textColor?: number | [number, number, number];
    fontStyle?: string;
  };
  styles?: {
    cellPadding?: number;
    fontSize?: number;
    textColor?: [number, number, number];
  };
  columnStyles?: Record<number, { cellWidth?: number }>;
  alternateRowStyles?: {
    fillColor?: [number, number, number];
  };
}

export interface VendorReviewsProps {
  vendorId: string;
  reviews: VendorReview[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface RevenueChartProps {
  role: Role;
}

export interface FileDetails {
  filename: string;
  originalFile: File;
}
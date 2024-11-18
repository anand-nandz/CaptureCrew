import * as yup from 'yup';
import { ServiceProvided } from '@/types/postTypes';
import { CustomizationOption } from '@/types/packageTypes';

// Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type PaymentStatus = 'pending' | 'completed';

export enum BookingAcceptanceStatus {
  Requested = 'requested',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Revoked = 'revoked'
}

export type PaymentDetails = {
  amount: number;
  status: PaymentStatus;
  paidAt?: string;  // Using string for dates in frontend
};

export type Booking = {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    contactinfo?: string;
    isActive: boolean;
  };
  vendor_id: {
    _id: string;
    name: string;
    companyName: string;
    contactinfo: string;
    city: string;
    isActive: boolean;
    bookedDates: string[];
  };
  name: string;
  startingDate: string;
  noOfDays: number;
  bookingStatus: BookingAcceptanceStatus;
  message: string;
  email: string;
  phone: string;
  serviceType: string;
  totalPrice: number;
  packageId: {
    _id: string;
    description: string;
    features: string[];
    photographerCount: number;
    price: number;
    customizationOptions: CustomizationOption[]

  };
  createdAt: string;
  updatedAt: string;
  venue: string;
  bookingReqId?: string;
  customizations: string[];
  advancePaymentDueDate?: string;  // Using string for dates in frontend
  advancePayment?: PaymentDetails;
};


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
}

// Helper functions
const hasUnavailableDates = (
  startDate: Date,
  numberOfDays: number,
  unavailableDates: string[]
): boolean => {
  const dates: string[] = [];
  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    dates.push(currentDate.toLocaleDateString('en-GB'));
  }
  return dates.some(date => unavailableDates.includes(date));
};

const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// Validation schema
export const createBookingValidationSchema = (unavailableDates: string[]) => {
  return yup.object().shape({
    name: yup
      .string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),

    email: yup
      .string()
      .required('Email is required')
      .email('Please enter a valid email address'),

    phone: yup
      .string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),

    venue: yup
      .string()
      .required('Venue is required')
      .min(3, 'Venue must be at least 3 characters')
      .max(100, 'Venue must not exceed 100 characters'),

    message: yup
      .string()
      .required('Message is required')
      .min(10, 'Message must be at least 10 characters')
      .max(500, 'Message must not exceed 500 characters'),

    serviceType: yup
      .string()
      .required('Please select an event type')
      .oneOf(
        Object.values(ServiceProvided),
        'Please select a valid event type'
      ),

    packageId: yup
      .string()
      .required('Please select a package'),

    totalPrice: yup
      .number()
      .required('Total price is required')
      .positive('Total price must be a positive number'),


    selectedDate: yup
      .string()
      .required('Please select a date')
      .test(
        'is-valid-date',
        'Please select a valid date',
        (value) => {
          if (!value) return false;
          const date = parseDate(value);
          return date >= new Date(new Date().setHours(0, 0, 0, 0));
        }
      )
      .test(
        'is-available-date',
        'Selected date is not available',
        (value) => {
          if (!value) return false;
          return !unavailableDates.includes(value);
        }
      ),

    noOfDays: yup
      .number()
      .required('Number of days is required')
      .min(1, 'Minimum booking duration is 1 day')
      .max(2, 'Maximum booking duration is 2 days')
      .test(
        'consecutive-days-available',
        'Selected duration includes unavailable dates',
        function (value) {
          const selectedDate = this.parent.selectedDate;
          if (!selectedDate || !value) return false;

          const startDate = parseDate(selectedDate);
          return !hasUnavailableDates(startDate, value, unavailableDates);
        }
      ),
  });
};

// Hook for using the validation
export const useBookingValidation = (unavailableDates: string[]) => {
  const validationSchema = createBookingValidationSchema(unavailableDates);

  const validateForm = async (formData: BookingFormData): Promise<ValidationResult> => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = err.inner.reduce((acc, error) => {
          if (error.path) {
            acc[error.path] = error.message;
          }
          return acc;
        }, {} as Record<string, string>);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { form: 'Validation failed' } };
    }
  };

  return { validateForm };
};
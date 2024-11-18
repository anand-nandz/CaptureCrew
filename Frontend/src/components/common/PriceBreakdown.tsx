import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Info, CreditCard } from "lucide-react";

interface CustomizationOption {
  _id: string;
  type: string;
  description: string;
  price: number;
  unit?: string;
}

interface Vendor {
  name: string;
  companyName: string;
  city: string;
  contactinfo: string;
}

interface BookingType {
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
  rejectionReason?: string;
  packageId: {
    price?: number;
    description: string;
    photographerCount: number;
    features: string[];
    customizationOptions: CustomizationOption[];
  };
  vendor_id: Vendor;
  customizations: string[];
  createdAt: string;
}

interface PriceBreakdownProps {
  booking: BookingType;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ booking }) => {
  // Calculate base price (number of days * package price)
  const basePrice = booking.noOfDays * (booking.packageId.price || 0); // Added fallback for optional price
  
  // Find selected customizations by matching IDs
  const selectedCustomizations = booking.packageId.customizationOptions.filter(
    (option: CustomizationOption) => booking.customizations.includes(option._id)
  );
  
//   // Calculate total customization price
//   const customizationTotal = selectedCustomizations.reduce(
//     (total: number, option: CustomizationOption) => total + option.price, 
//     0
//   );

  // Format price to INR currency
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">Total Booking Price:</span>
        <span className="text-sm font-bold">
          {formatPrice(booking.totalPrice)}
        </span>
      </div>
      
      <Popover>
        <PopoverTrigger>
          <button className="ml-2 p-1 hover:bg-gray-100 rounded-full">
            <Info className="w-4 h-4 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Pricing Breakdown</h3>
            
            {/* Base Package Details */}
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">Base Package:</span>
                <div className="ml-4 text-gray-600">
                  <div>{booking.serviceType} Photography Package</div>
                  <div className="flex justify-between">
                    <span>{formatPrice(booking.packageId.price || 0)} × {booking.noOfDays} day(s)</span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customizations */}
            {selectedCustomizations.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium">Added Customizations:</div>
                {selectedCustomizations.map((option: CustomizationOption) => (
                  <div key={option._id} className="ml-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                    {`${option.type} - ${formatPrice(option.price)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm font-bold">
                <span>Total Amount:</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PriceBreakdown;
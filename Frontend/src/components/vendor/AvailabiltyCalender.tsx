import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,

} from '@nextui-org/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone
} from 'lucide-react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { showToastMessage } from '@/validations/common/toast';
import { VendorData } from '@/types/vendorTypes';
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor';
import { ServiceProvided } from '@/types/postTypes';
import { BookingModal } from '../user/BookingFormModal';
import { Package } from '@/types/packageTypes';

interface UnifiedCalendarProps {
  isVendor?: boolean;
  vendorDetails?: VendorData | null;
  packages?: Package[];
  axiosInstance: AxiosInstance;
}
type Mode = 'block' | 'unblock';

interface BookingFormData {
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





export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  isVendor = false,
  vendorDetails,
  packages,
  axiosInstance
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('block');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    venue: '',
    serviceType: '',
    noOfDays: 1,
    packageId: '',
    totalPrice: 0,
    message: '',
    selectedDate: '',
    customizations: []
  });

  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  useEffect(() => {
    if (selectedDates.length > 0) {
      setBookingForm(prev => ({
        ...prev,
        selectedDate: selectedDates[0]
      }));
    }
  }, [selectedDates]);


  const fetchUnavailableDates = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.get('/dateAvailabilty');
      if (response.data.result?.bookedDates) {
        setUnavailableDates(response.data.result.bookedDates);
      }

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data?.message || 'Failed to get dates', 'error');
      } else {
        showToastMessage('Failed to fetch unavailable dates', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    if (isVendor) {
      fetchUnavailableDates();
    } else if (vendorDetails?.bookedDates) {
      setUnavailableDates(vendorDetails.bookedDates);
    }
  }, [isVendor, vendorDetails, fetchUnavailableDates]);


  const updateAvailability = async () => {
    if (selectedDates.length === 0) {
      showToastMessage('Please select at least one date', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = mode === 'block' ? '/dateAvailabilty' : '/dateAvailabilty/unblock';
      const response = await axiosInstance.post(endpoint, {
        dates: selectedDates
      });

      if (response.data.success) {
        if (mode === 'block') {
          setUnavailableDates(prev => [...new Set([...prev, ...selectedDates])]);
        } else {
          setUnavailableDates(prev => prev.filter(date => !selectedDates.includes(date)));
        }
        showToastMessage(`Successfully ${mode}ed ${selectedDates.length} date(s)`, 'success');
      }

      setSelectedDates([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data?.message || 'Failed to update dates', 'error');
      } else {
        showToastMessage('Failed to connect to the server', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent, formData?: BookingFormData) => {
    e.preventDefault();
    try {
      console.log(formData || bookingForm, 'bookingform');
      
      const response = await axiosInstance.post('/bookings/request', {
        ...(formData || bookingForm),
        vendorId: vendorDetails?._id,
        startingDate: selectedDates[0]
      });

      if (response.data.success) {
        showToastMessage('Booking request sent successfully', 'success');
        setShowBookingModal(false);
        setBookingForm({
          name: '',
          phone: '',
          email: '',
          venue: '',
          serviceType: '',
          noOfDays: 1,
          packageId: '',
          totalPrice: 0,
          message: '',
          selectedDate: '',
          customizations:[]
        });
        setSelectedDates([]);
      } else {
      showToastMessage('Failed to send booking request', 'error');
    }
    } catch (error) {
      console.error('Error while submiting: ', error);
      if(error instanceof AxiosError){
        showToastMessage(error.response?.data.message,'error')
      }else{
        showToastMessage('Failed to send booking request', 'error');
      }
      
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB');
  };
  const handleDateClick = (date: Date) => {
    if (date < TODAY) return;

    const formattedDate = formatDate(date);
    const isUnavailable = unavailableDates.includes(formattedDate);

    if (isVendor) {
      if (selectedDates.length === 0) {
        setMode(isUnavailable ? 'unblock' : 'block');
      }
      if ((mode === 'block' && !isUnavailable) || (mode === 'unblock' && isUnavailable)) {
        setSelectedDates(prev => {
          if (prev.includes(formattedDate)) {
            return prev.filter(d => d !== formattedDate);
          } else {
            return [formattedDate];
          }
        });
      }
    } else if (!isUnavailable) {
      setSelectedDates([formattedDate]);
      setShowBookingModal(true);
    }
  };

  const getDateStatus = (date: Date) => {
    const formattedDate = formatDate(date);
    if (date < TODAY) return 'past';
    if (selectedDates.includes(formattedDate)) return 'selected';
    if (unavailableDates.includes(formattedDate)) return 'unavailable';
    return 'available';
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newDate >= new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)) {
      setCurrentMonth(newDate);
    }
  };

  const handleModalDateSelect = (date: Date) => {
    const formattedDate = formatDate(date);
    if (!unavailableDates.includes(formattedDate)) {
      setSelectedDates([formattedDate]);
      setBookingForm(prev => ({
        ...prev,
        selectedDate: formattedDate
      }));
    }
  };


  return (

    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="shadow-xl">
        {isVendor ? <SidebarVendor /> : <></>}
      </div>


      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <CalendarIcon className="w-8 h-8 text-[#B8860B] mr-3" />
            <h1 className="text-4xl font-light tracking-[0.2em] text-[#B8860B] text-center uppercase">
              Availability
            </h1>
          </div>

          <div className="max-w-4xl mx-auto p-4">
            <Card className="w-full shadow-xl">
              <CardHeader className="flex-col gap-2 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">
                      {isVendor ? 'Manage Availability' : 'Service Availability'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isVendor
                        ? 'Click on dates to toggle their availability status'
                        : 'Click on available dates to request a booking'
                      }
                    </p>
                  </div>
                </div>
              </CardHeader>



              <CardBody className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={prevMonth}
                    disabled={currentMonth <= new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={nextMonth}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2 px-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 mb-2">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                    const date = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      i + 1
                    );
                    const status = getDateStatus(date);

                    return (
                      <button
                        key={i}
                        onClick={() => handleDateClick(date)}
                        disabled={status === 'past'}
                        className="relative flex items-center justify-center h-8"
                      >
                        <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    transition-all duration-200
                    ${status === 'past' ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                    ${status === 'selected' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${status === 'unavailable' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                    ${status === 'available' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                  `}>
                          <span className="text-sm">{i + 1}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 mt-6 justify-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Unavailable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                </div>

                {isVendor && selectedDates.length > 0 && (
                  <div className="mt-6">
                    <Button
                      className={`w-full font-semibold text-white ${mode === 'block' ? 'bg-black' : 'bg-green-600'}`}
                      onClick={updateAvailability}
                      isLoading={isLoading}
                      size="lg"
                      radius="lg"
                      startContent={!isLoading && <CalendarIcon className="w-4 h-4" />}
                    >
                      {isLoading
                        ? "Updating Availability..."
                        : `Mark ${selectedDates.length} Selected Date${selectedDates.length > 1 ? 's' : ''} as ${mode === 'block' ? 'Unavailable' : 'Available'}`
                      }
                    </Button>
                  </div>
                )}

                {!isVendor && (
                  <div className="flex justify-center gap-4 mt-6">
                    <Button
                      color="danger"
                      className="bg-red-800"
                      startContent={<Phone className="h-4 w-4" />}
                      onPress={() => window.location.href = `tel:${vendorDetails?.contactinfo}`}
                    >
                      Call Us
                    </Button>
                    <Button
                      color="danger"
                      className="bg-red-800"
                      startContent={<MessageCircle className="h-4 w-4" />}
                      onPress={() => setShowBookingModal(true)}
                    >
                      Request Quote
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            <BookingModal
              isOpen={showBookingModal}
              onOpenChange={setShowBookingModal}
              bookingForm={bookingForm}
              setBookingForm={setBookingForm}
              onSubmit={handleBookingSubmit}
              selectedDate={selectedDates[0]} // Pass the selected date
              packages={packages || []} // Pass the packages array
              unavailableDates={unavailableDates}
              onDateSelect={handleModalDateSelect}
            />

          </div>

        </div>
      </div>
    </div>
  );
};
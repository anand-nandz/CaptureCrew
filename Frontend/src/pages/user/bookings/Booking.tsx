import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import Sidebar from "../../../layout/user/Sidebar";
import { useEffect, useState } from "react";
import { BookingTable } from "../../../components/user/BookinTable";
import { axiosInstance } from "@/config/api/axiosInstance";
import { Booking, BookingAcceptanceStatus } from "@/validations/user/bookingValidation";
import { Spinner } from "@nextui-org/react";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";

type TabValue = 'bookingHistory' | 'bookingRequests' | 'paymentDetails';

function BookingUser() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>('bookingHistory');

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/bookings')
      if (response.data.bookingReqs) {
        setBookings(response.data.bookingReqs)
      }

    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        showToastMessage(error.response?.data.message || 'Error fetching booking data', 'error');
      } else {
        showToastMessage('An unknown error occurred', 'error');
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  
  const requestBookings = bookings.filter(
    booking => booking.bookingStatus === 'requested'
  );




  const handleRevokeBooking = async (bookingId: string) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      const booking = response.data;
      if (booking.bookingStatus === BookingAcceptanceStatus.Requested) {
        await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
        const updatedBookings = bookings.filter((b) => b._id !== bookingId);
        setBookings(updatedBookings);
      } else {
        showToastMessage(`Cannot revoke booking, status is ${booking.bookingStatus}`, 'error');
      }

    } catch (error) {
      console.error('Error revoking booking:', error);
      if (error instanceof AxiosError) {
        showToastMessage(error.response?.data.message || 'Error loading profile', 'error');
      } else {
        showToastMessage('An unknown error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className=" md:block">
        <Sidebar />
      </div>
      <div className="overflow-x-auto mt-5 pt-20 ps-6 w-screen">
        <h1 className="text-4xl font-light tracking-[0.2em] text-[#B8860B] text-center mb-10 uppercase">
          Bookings
        </h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <Tabs value={currentTab} onChange={(value: TabValue) => setCurrentTab(value)}>
            <TabsHeader onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
              <Tab value="bookingHistory" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>Booking History</Tab>
              <Tab value="bookingRequests" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>Booking Requests</Tab>
              <Tab value="paymentDetails" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>Payment Details</Tab>
            </TabsHeader>
            <TabsBody onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
              <TabPanel value="bookingHistory" >
                <BookingTable title="Booking History" bookings={bookings} onCancel={handleRevokeBooking}/>
              </TabPanel>
              <TabPanel value="bookingRequests">
                <BookingTable title="Booking Requests" bookings={requestBookings} onCancel={handleRevokeBooking} />
              </TabPanel>
              <TabPanel value="paymentDetails">
                {/* Payment Details Content */}
                <h2>Payment details</h2>
              </TabPanel>
            </TabsBody>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default BookingUser;
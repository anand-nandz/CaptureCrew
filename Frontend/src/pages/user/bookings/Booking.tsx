import { Tabs, TabsHeader, TabsBody, Tab, TabPanel, Chip } from "@material-tailwind/react";
import Sidebar from "../../../layout/user/Sidebar";
import { useEffect, useState } from "react";
import { BookingTable } from "../../../components/user/BookinTable";
import { axiosInstance } from "@/config/api/axiosInstance";
import { Booking, BookingAcceptanceStatus } from "@/validations/user/bookingValidation";
import { Spinner } from "@nextui-org/react";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import { BookingConfirmed, BookingStatus } from "@/types/bookingTypes";
import { BookingConfirmedTable } from "@/components/user/BookingConfirmedTable";
import Swal from "sweetalert2";
import { PaymentStatus, TabValue } from "@/types/extraTypes";

function BookingUser() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [confirmedBooking, setConfirmedBookings] = useState<BookingConfirmed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>('bookingHistory');
  const [count, setCount] = useState(0)
  const [countReq, setCountReq] = useState(0)
  const [countConfirm, setCountConfirmed] = useState(0)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/bookings')
      
      if (response.data.bookingReqs) {
        setBookings(response.data.bookingReqs)
      }
      if (response.data.bookingConfirmed) {
        setConfirmedBookings(response.data.bookingConfirmed)
        setCountConfirmed(response.data.bookingConfirmed.length)
      }
    
    } catch (error) {
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
  useEffect(() => {
    setCount(bookings.length);
    setCountReq(requestBookings.length)
  }, [bookings, requestBookings]);

  const updateBookingStatusToCancelled = (bookingId: string) => {
    const updatedConfirmedBookings = confirmedBooking.map((booking) => {
        if (booking.bookingId === bookingId) {
            return { 
              ...booking, 
              bookingStatus: BookingStatus.Cancelled ,
              cancelledAt: new Date().toISOString(),
              advancePayment: {
                ...booking.advancePayment,
                status: PaymentStatus.Refund,
                refundedAt: new Date().toISOString(),
            },

            }; 
        }
        return booking;
    });

    setConfirmedBookings(updatedConfirmedBookings);
};



  const handleRevokeBooking = async (bookingId: string) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`)
      const booking = response.data.result;
      
      if (booking.bookingStatus !== BookingAcceptanceStatus.Requested) {
        await Swal.fire({
          icon: 'warning',
          title: 'Cannot Revoke Booking',
          text: `This booking cannot be revoked. Current status: ${booking.bookingStatus}`,
          confirmButtonText: 'OK'
        })
        await fetchData()
        return
      }

      const confirmResult = await Swal.fire({
        title: 'Revoke Booking?',
        text: 'Are you sure you want to revoke this booking request?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, revoke it!'
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      const cancelResponse = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
       
      if (cancelResponse.status === 200) {
        const updatedBookings = bookings.filter((b) => b._id !== bookingId);
        setBookings(updatedBookings);

        await Swal.fire({
          icon: 'success',
          title: 'Booking Revoked',
          text: 'Your booking request has been successfully cancelled.',
          confirmButtonText: 'OK'
        });

        await fetchData();
      }
    } catch (error) {
      console.error('Error revoking booking:', error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.status === 404
          ? 'Booking not found. It may have been already processed.'
          : error.response?.data?.message || 'Failed to revoke booking';

        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Unexpected Error',
          text: 'An unknown error occurred while trying to revoke the booking',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  
const handleBookingUpdate = (updatedBooking: BookingConfirmed) => {
  setConfirmedBookings(prevBookings => 
    prevBookings.map(booking => 
      booking._id === updatedBooking._id ? updatedBooking : booking
    )
  );
};

  return (
    <div className="flex">
      <div className="md:block">
        <Sidebar />
      </div>
      <div className="overflow-x-auto mt-3 pt-10 ps-6 w-screen ">
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
              <Tab value="bookingHistory" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <div className="flex items-center space-x-2">
                  <span>Booking History</span>
                  <Chip value={count} size="sm" className="rounded-full bg-black text-white" />
                </div>
              </Tab>
              <Tab value="bookingRequests" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <div className="flex items-center space-x-2">
                  <span>Booking Requests</span>
                  <Chip value={countReq} size="sm" className="rounded-full bg-black text-white" />
                </div>
              </Tab>
              <Tab value="bookingConfirmed" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <div className="flex items-center space-x-2">
                  <span>Confirmed Booking</span>
                  <Chip value={countConfirm} size="sm" className="rounded-full bg-black text-white" />
                </div>
              </Tab>
            </TabsHeader>
            <TabsBody onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
              <TabPanel value="bookingHistory" >
                <BookingTable title="Booking History" bookings={bookings} onCancel={handleRevokeBooking} />
              </TabPanel>
              <TabPanel value="bookingRequests">
                <BookingTable title="Booking Requests" bookings={requestBookings} onCancel={handleRevokeBooking} />
              </TabPanel>
              <TabPanel value="bookingConfirmed">
                <BookingConfirmedTable 
                  title="Booking Confirmed" 
                  bookingConfirmed={confirmedBooking}  
                  onBookingCancelled={updateBookingStatusToCancelled} 
                  onBookingUpdate={handleBookingUpdate}/>
              </TabPanel>

            </TabsBody>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default BookingUser;
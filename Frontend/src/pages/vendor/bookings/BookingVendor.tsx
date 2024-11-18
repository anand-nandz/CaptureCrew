import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor";
import { Booking } from "@/validations/user/bookingValidation";
import { axiosInstanceVendor } from "@/config/api/axiosInstance";
import { BookingTable } from "@/components/user/BookinTable";
import { showToastMessage } from "@/validations/common/toast";
import { Spinner } from "@nextui-org/react";
import { AxiosError } from "axios";

type TabValue = 'bookingHistory' | 'bookingRequests' | 'paymentDetails';

function BookingVendor() {
  const [currentTab, setCurrentTab] = useState<string>('bookingHistory');
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstanceVendor.get('/bookings')
      if (response.data.bookingReqs) {
        setBookings(response.data.bookingReqs)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);

      if(error instanceof AxiosError){
        showToastMessage(error.response?.data.message || 'Failed to fetch bookings','error')
      } else{
        showToastMessage('An unknown error occurred', 'error');
      }

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentTab])

  const historyBookings = bookings.filter(
    booking => booking.bookingStatus === 'accepted' || booking.bookingStatus === 'rejected'
  );
  
  const requestBookings = bookings.filter(
    booking => booking.bookingStatus === 'requested' || booking.bookingStatus === 'revoked'
  );

  const handleBooking = async (bookingId: string, action: 'accept' | 'reject', rejectionReason?: string) => {
    setIsLoading(true);
    try {

      const response = await axiosInstanceVendor.patch(
        `/bookings/accept-reject?bookingId=${bookingId}&action=${action}`, { rejectionReason }
      );

      showToastMessage(response.data.message, 'success')
      const updatedBookings = bookings.filter((b) => b._id !== bookingId);
      setBookings(updatedBookings);
      await fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
      if(error instanceof AxiosError){
        showToastMessage(error.response?.data.message || 'Error updateing booking','error')
      } else{
        showToastMessage('An unknown error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex">
      <div className=" md:block">
        <SidebarVendor />
      </div>
      <div className="overflow-x-auto mt-5 pt-12 ps-6 w-screen">
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
            <Tab value="bookingHistory"
              onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
            >
              Booking History
            </Tab>
            <Tab value="bookingRequests"
              onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
            >
              Booking Requests
            </Tab>
            <Tab value="paymentDetails"
              onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
            >
              Payment Details
            </Tab>
          </TabsHeader>
          <TabsBody onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
            <TabPanel value="bookingHistory">
              <BookingTable
                title="Booking History"
                bookings={historyBookings}
                isVendor={true}
                onAccept={async (id: string, errorMessage?: string) => await handleBooking(id, 'accept', errorMessage)}
                onReject={async (id: string, reason: string) => {
                  await handleBooking(id, 'reject', reason);
                }}
              />
            </TabPanel>
            <TabPanel value="bookingRequests">
            <BookingTable 
                  title="Booking Requests" 
                  bookings={requestBookings} 
                  isVendor={true}
                  onAccept={async (id) => await handleBooking(id, 'accept')}
                  onReject={async (id: string, reason: string) => {
                    await handleBooking(id, 'reject', reason);
                  }}
                />            
                </TabPanel>
            <TabPanel value="paymentDetails">
              {/* Payment Details Content */}
              <h2>Payment detilas</h2>
            </TabPanel>
          </TabsBody>
        </Tabs>
        )}
      </div>
    </div>
  );
}

export default BookingVendor;
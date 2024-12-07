import { Tabs, TabsHeader, TabsBody, Tab, TabPanel, Chip } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { axiosInstanceAdmin } from "@/config/api/axiosInstance";
import { Spinner } from "@nextui-org/react";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import AdminBookingTable from "@/components/admin/booking/AdminBookingTable";
import { BookingConfirmed } from "@/types/bookingTypes";

type TabValue = 'bookingHistory' | 'bookingRequests' | 'paymentDetails';

function AdminBooking() {
  const [bookings, setBookings] = useState<BookingConfirmed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>('bookingHistory');
  const [count, setCount] = useState(0)
  const [countComplete, setCountComplete] = useState(0)
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstanceAdmin.get('/all-bookingsReqs')
      console.log(response.data.bookingReqs);

      if (response.data.bookingReqs) {
        setBookings(response.data.bookingReqs)
        setCount(response.data.bookingReqs.length)
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

  const completedBookings = bookings.filter(
    booking => booking.bookingStatus === 'completed'
  );

  useEffect(() => {
    setCount(bookings.length);
    setCountComplete(completedBookings.length)
  }, [bookings, completedBookings]);




  return (
    <div className="flex">
      <div className="overflow-x-auto pt-5 ps-2 w-full">
        <h1 className="text-4xl font-light tracking-[0.2em] text-[#B8860B] text-center mb-10 uppercase">
          All Bookings
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
              {/* <Tab value="bookingRequests" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>Booking Requests</Tab> */}
              <Tab value="bookingCompleted" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <div className="flex items-center space-x-2">
                  <span>Booking Completed</span>
                  <Chip value={countComplete} size="sm" className="rounded-full bg-black text-white" />
                </div>
              </Tab>
            </TabsHeader>
            <TabsBody onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
              <TabPanel value="bookingHistory" >
                <AdminBookingTable title="Booking History" bookings={bookings} />
              </TabPanel>
              {/* <TabPanel value="bookingRequests"> */}
              {/* <AdminBookingTable title="Booking Requests" bookings={requestBookings}  /> */}
              {/* <h2>req</h2> */}
              {/* </TabPanel> */}
              <TabPanel value="bookingCompleted">
                <AdminBookingTable title="Booking Completed" bookings={completedBookings} />
              </TabPanel>
            </TabsBody>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default AdminBooking;
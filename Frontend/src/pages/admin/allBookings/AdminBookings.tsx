import { Tabs, TabsHeader, TabsBody, Tab, TabPanel, Chip, Input, Typography } from "@material-tailwind/react";
import { useCallback, useEffect, useState } from "react";
import { axiosInstanceAdmin } from "@/config/api/axiosInstance";
import { Spinner } from "@nextui-org/react";
import { showToastMessage } from "@/validations/common/toast";
import { AxiosError } from "axios";
import AdminBookingTable from "@/components/admin/booking/AdminBookingTable";
import { BookingConfirmed } from "@/types/bookingTypes";
import { debounce } from 'lodash';

type TabValue = 'bookingHistory' | 'bookingCompleted';

function AdminBooking() {
  const [bookings, setBookings] = useState<BookingConfirmed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>('bookingHistory');
  const [count, setCount] = useState(0)
  const [countComplete, setCountComplete] = useState(0)
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search?: string) => {
    setIsLoading(true)
    try {
      const response = await axiosInstanceAdmin.get('/all-bookingsReqs', {
        params: {
          search: search
        }
      })

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
  }, [])

  const debouncedFetchData = useCallback(
    debounce(fetchData, 800),
    [fetchData]
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 3 || searchTerm.trim().length >= 5) {
      debouncedFetchData(searchTerm);
    } else if (searchTerm.trim() === '') {
      debouncedFetchData('');
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [searchTerm, debouncedFetchData]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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

        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-center text-2xl lg:text-3xl md:text-2xl sm:text-xl uppercase"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}>
            All Bookings
          </Typography>

          <div className="w-full lg:w-1/4 md:w-1/2 sm:w-full">
            <Input
              label="Search"
              value={searchTerm}
              onChange={handleSearch}
              crossOrigin={undefined}
              placeholder="Search bookings..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
              labelProps={{
                className: "hidden",
              }}
              containerProps={{
                className: "min-w-[80px] relative"
              }}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64 my-6">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <div className="mt-6">
            <Tabs value={currentTab} onChange={(value: TabValue) => setCurrentTab(value)}>
              <TabsHeader onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                <Tab value="bookingHistory" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}>
                  <div className="flex items-center space-x-2">
                    <span>Booking History</span>
                    <Chip value={count} size="sm" className="rounded-full bg-black text-white" />
                  </div>
                </Tab>
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
                  <AdminBookingTable title="Booking Completed" bookings={completedBookings}/>
                </TabPanel>
              </TabsBody>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBooking;
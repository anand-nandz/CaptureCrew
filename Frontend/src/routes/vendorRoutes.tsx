import { Route, Routes } from "react-router-dom";
import VendorSignUp from "../pages/vendor/auth/VendorSignUp";
import VendorLogin from '../pages/vendor/auth/VendorLogin';
import Dashboard from '../pages/vendor/dashborad/Dashboard';
import UnifiedPrivateRoute from '../pages/PrivateRouteProps';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PublicRoute from '../pages/PublicRouteProps';
import ResetPassword from "../pages/user/auth/ResetPassword";
import VendorProfile from "../pages/vendor/profile/vendorProfile";
import VerifyEmailVendor from "../pages/common/VerifVendorotp";
import Posts from "../pages/vendor/posts/posts";
import CreatePost from "../pages/vendor/posts/createPost";
import AddPackage from "../pages/vendor/bookings/AddPackage";
import PackageListing from "../pages/vendor/bookings/PackageListing";
import AvailableDate from "../pages/vendor/bookings/AvailableDate";
import BookingVendor from "../pages/vendor/bookings/BookingVendor";
import TVScreen from "@/components/common/404";
import WalletDashboard from "@/pages/common/wallet-dash";
import Chat from "@/pages/vendor/chat/ChatVendor";
import VendorReviewList from "@/pages/vendor/bookings/ClientReviews";
import RevenueChartVendor from "@/components/vendor/RevenueCardVendor";
export const VendorRoutes = () => {
 
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicRoute routeType="vendor" />}>
          <Route path="/signup" element={<VendorSignUp />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/verify-email" element={<VerifyEmailVendor />} />
          <Route path='/forgot-password/:token' element={<ResetPassword />} />
        </Route>
        

        <Route  element={<UnifiedPrivateRoute routeType="vendor" />}>
          <Route path={`/dashboard`} element={<Dashboard />} />
          <Route path={`/profile/*`} element={<VendorProfile />} />
          <Route path={`/view-posts`} element={<Posts/>}/>
          <Route path={`/add-post`} element={<CreatePost/>}/>
          <Route path={`/view-packages`} element={<PackageListing/>} />
          <Route path={`/add-package`} element={<AddPackage/>}/>
          <Route path={`/dateAvailabilty`} element={<AvailableDate/>}/>
          <Route path={`/requestBookings`} element={<BookingVendor/>} />
          <Route path={`/chat`} element={<Chat/>}/>
          <Route path={`/review`} element={<VendorReviewList/>}/>
          <Route path={`/wallet`} element={<WalletDashboard isVendor={true}/>} />
          <Route path={`/stats`} element={<RevenueChartVendor/> } />
          
        </Route>
        <Route path="*" element={<TVScreen />} />

      </Routes>
      </ErrorBoundary>

  )
}




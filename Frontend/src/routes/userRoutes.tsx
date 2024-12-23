import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { USER } from '../config/constants/constants';
import PublicRoute from '../pages/PublicRouteProps';
import UnifiedPrivateRoute from '../pages/PrivateRouteProps';
import UserSignUp from '../pages/user/auth/SignUp';
import UserLogin from '../pages/user/auth/Login';
import VerifyEmail from '../pages/common/VerifyEmail';
import ResetPassword from '../pages/user/auth/ResetPassword';
import Home from '../pages/user/home/Home';
import ErrorBoundary from '../components/common/ErrorBoundary';
import UserProfile from '../pages/user/profile/userProfile';
import VendorList from '../pages/user/vendorListing';
import Posts from '../pages/user/home/Posts';
import VendorPorfolio from '../pages/user/vendorPorfolio';
import ShowAvailabilty from '@/pages/user/bookings/ShowAvailabilty';
import BookingUser from '../pages/user/bookings/Booking';
import TVScreen from '@/components/common/404';
import PaymentSuccess from '@/pages/user/bookings/PaymentSuccess';
import PaymentFailed from '@/pages/user/bookings/PaymentFailed';
import WalletDashboard from '@/pages/common/wallet-dash';
import Chat from '@/pages/user/chat/Chat';
import About from '@/pages/common/AboutUs';

const UserRoutes: React.FC = () => {
  return (
    // <ErrorBoundary>
    <Routes>
      <Route element={<PublicRoute routeType='user' />}>
        <Route path={USER.SIGNUP} element={<ErrorBoundary><UserSignUp /></ErrorBoundary>} />
        <Route path={USER.LOGIN} element={<ErrorBoundary><UserLogin /></ErrorBoundary>} />
        <Route path={USER.VERIFY} element={<ErrorBoundary><VerifyEmail /></ErrorBoundary>} />
        <Route path={USER.FORGOT_PWDMAIL} element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
      </Route>
      
      <Route element={<UnifiedPrivateRoute routeType='user' />}>
        <Route path={USER.HOME} element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path={`${USER.PROFILE}`} element={<ErrorBoundary><UserProfile /></ErrorBoundary>} />
        <Route path={`${USER.VENDORLIST}/*`} element={<ErrorBoundary><VendorList/></ErrorBoundary>} />
        <Route path={`${USER.POST}/*`} element={<ErrorBoundary><Posts/></ErrorBoundary>}/>
        <Route path={`${USER.PORTFOLIO}/:vendorId`} element ={<ErrorBoundary><VendorPorfolio/></ErrorBoundary>}/>
        <Route path={`${USER.SERVICE_AVAILABILTY}/:vendorId`} element ={<ErrorBoundary><ShowAvailabilty/></ErrorBoundary>}/>
        <Route path={`${USER.BOOKING}/*`} element={<ErrorBoundary><BookingUser/></ErrorBoundary>}/>
        <Route path={`${USER.CHAT}`} element={<Chat/>}/>
        <Route path={`${USER.WALLET}/*`} element={<ErrorBoundary><WalletDashboard/></ErrorBoundary>}/>
        <Route path={`${USER.PAYMENT_SUCCESS}`} element={<ErrorBoundary><PaymentSuccess/></ErrorBoundary>}/>
        <Route path={`${USER.PAYMENT_FAILURE}`} element={<ErrorBoundary><PaymentFailed/></ErrorBoundary>}/>
        <Route path={`${USER.ABOUT_US}`} element={<About/>}/>

      </Route>
      <Route path="*" element={<TVScreen  />} />


    </Routes>
    // </ErrorBoundary>
  );
};

export default UserRoutes;
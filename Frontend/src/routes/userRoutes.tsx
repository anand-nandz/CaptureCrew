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

const UserRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
    <Routes>
      <Route element={<PublicRoute routeType='user' />}>
        <Route path={USER.SIGNUP} element={<UserSignUp />} />
        <Route path={USER.LOGIN} element={<UserLogin />} />
        <Route path={USER.VERIFY} element={<VerifyEmail />} />
        <Route path={USER.FORGOT_PWDMAIL} element={<ResetPassword />} />
      </Route>
      
      <Route element={<UnifiedPrivateRoute routeType='user' />}>
        <Route path={USER.HOME} element={<Home />} />
        <Route path={`${USER.PROFILE}/*`} element={<UserProfile />} />
        <Route path={`${USER.VENDORLIST}/*`} element={<VendorList/>} />
      </Route>
    </Routes>
    </ErrorBoundary>
  );
};

export default UserRoutes;
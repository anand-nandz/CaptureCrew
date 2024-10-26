import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserRootState from '../redux/rootstate/UserState';
import VendorRootState from '../redux/rootstate/VendorState';
import AdminRootState from '../redux/rootstate/AdminState';
import { USER, VENDOR, ADMIN } from '../config/constants/constants';

type RouteType = 'user' | 'vendor' | 'admin';

interface PublicRouteProps {
  routeType: RouteType;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ routeType }) => {
  const location = useLocation();
  const userSignedIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);
  const vendorSignedIn = useSelector((state: VendorRootState) => state.vendor.isVendorSignedIn);
  const adminSignedIn = useSelector((state: AdminRootState) => state.admin.isAdminSignedIn);

  const isAuthenticated = (type: RouteType): boolean => {
    switch (type) {
      case 'user':
        return userSignedIn;
      case 'vendor':
        return vendorSignedIn;
      case 'admin':
        return adminSignedIn;
      default:
        return false;
    }
  };

  const getRedirectPath = (type: RouteType): string => {
    switch (type) {
      case 'user':
        return USER.HOME;
      case 'vendor':
        return VENDOR.DASHBOARD;
      case 'admin':
        return `/admin${ADMIN.DASHBOARD}`;
      default:
        return USER.HOME;
    }
  };

  if (isAuthenticated(routeType)) {
    return <Navigate to={getRedirectPath(routeType)} state={{ from: location }} replace />;
  }

  // If not authenticated, render the public route
  return <Outlet />;
};

export default PublicRoute;
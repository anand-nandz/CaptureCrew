import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';
import UserRootState from '../redux/rootstate/UserState';
import VendorRootState from '../redux/rootstate/VendorState';
import AdminRootState from '../redux/rootstate/AdminState';
import { USER, VENDOR, ADMIN} from '../config/constants/constants';
// import { useBlockCheck } from '../hooks/user/useBlockCheck';

type RouteType = 'user' | 'vendor' | 'admin';

interface PrivateRouteProps {
  routeType: RouteType;
}

const UnifiedPrivateRoute: React.FC<PrivateRouteProps> = ({ routeType }) => {
  const userState = useSelector((state: UserRootState) => state.user.userData);  
  const userSignedIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);

  const vendorState = useSelector((state: VendorRootState) => state.vendor.vendorData);
  const vendorSignedIn = useSelector((state: VendorRootState) => state.vendor.isVendorSignedIn);

  const adminSignedIn = useSelector((state: AdminRootState) => state.admin.isAdminSignedIn);

  // useBlockCheck(routeType)

  const getRedirectPath = (type: RouteType): string => {
    switch (type) {
      case 'user':
        return USER.LOGIN;
      case 'vendor':
        return VENDOR.LOGIN;
      case 'admin':
        return `/admin${ADMIN.LOGIN}`;
      default:
        return USER.LOGIN;
    }
  };

  const isAuthenticated = (type: RouteType): boolean => {
    switch (type) {
      case 'user':
        return userSignedIn && userState?.isActive !== false;
      case 'vendor':
        return vendorSignedIn && vendorState?.isActive !== false;
      case 'admin':
        return adminSignedIn;
      default:
        return false;
    }
  };

  return isAuthenticated(routeType) ? (
    <Outlet />
  ) : (
    <Navigate to={getRedirectPath(routeType)} replace />
  );
};

export default UnifiedPrivateRoute;


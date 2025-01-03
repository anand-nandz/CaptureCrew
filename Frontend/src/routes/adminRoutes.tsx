import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ADMIN } from '../config/constants/constants';
// import AdminCheck from '../pages/admin/AdminCheck';
import Login from '../pages/admin/auth/Login';
import Dashboard from '../pages/admin/profile/Dashboard';
import UserList from '../pages/admin/profile/userList';
import VendorList from '../pages/admin/profile/vendorList';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Layout from '../layout/admin/layout';
// import PublicRoute from '../pages/PublicRouteProps';
import UnifiedPrivateRoute from '../pages/PrivateRouteProps';
import PostList from '../pages/admin/profile/postList';
import AdminBooking from '@/pages/admin/allBookings/AdminBookings';
import ReportList from '@/pages/admin/profile/reportList';

const AdminRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route>
          {/* <Route element={<PublicRoute routeType="admin" />}> */}

          <Route index path={ADMIN.LOGIN} element={<Login />} />
          {/* </Route> */}
          <Route path='' element={<UnifiedPrivateRoute routeType="admin" />}>
            <Route element={<Layout />}>
              <Route path={ADMIN.DASHBOARD} element={<Dashboard />} />
              <Route path={ADMIN.USERS} element={<UserList />} />
              <Route path={ADMIN.VENDORS} element={<VendorList />} />
              <Route path={ADMIN.POST} element={<PostList />} />
              <Route path={ADMIN.ALLBOOKINGS} element={<AdminBooking />} />
              <Route path={ADMIN.REPORT} element={<ReportList />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default AdminRoutes;
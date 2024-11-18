import React, { useEffect, useState } from 'react'
import Loader from './components/common/Loader'
import { NextUIProvider } from '@nextui-org/react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import ScrollToTopButton from './components/home/ScrollToTopButton'
import ErrorBoundary from './components/common/ErrorBoundary'

import UserRoutes from './routes/userRoutes'
import AdminRoutes from './routes/adminRoutes'
import { VendorRoutes } from './routes/vendorRoutes'
import { useAuthCheck } from './hooks/user/useAuthCheck'
import { useBlockCheck } from './hooks/user/useBlockCheck'


const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  useAuthCheck();
  useBlockCheck()
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname])
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [])

  if (loading) {
    return <Loader />;
  }

  return (
    <NextUIProvider>
      <ErrorBoundary>
      <React.Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
        </Routes>
        <ScrollToTopButton />
      </React.Suspense>
      </ErrorBoundary>
    </NextUIProvider>
  );
}

export default App

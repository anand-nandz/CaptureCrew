import { UnifiedCalendar } from '@/components/vendor/AvailabiltyCalender'
import Footer from '../../../layout/user/footer'
import { useCallback, useEffect, useState } from 'react';
import { VendorData } from '@/types/vendorTypes';
import { showToastMessage } from '@/validations/common/toast';
import { useNavigate } from 'react-router-dom';
import { VENDOR } from '@/config/constants/constants';
import { axiosInstanceVendor } from '@/config/api/axiosInstance';

const AvailableDate = () => {
  const [vendor, setVendor] = useState<VendorData | undefined>(undefined);
  const navigate = useNavigate()

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await axiosInstanceVendor.get('/profile')
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error instanceof Error) {
        showToastMessage(error.message || 'Error loading profile', 'error');
      } else {
        showToastMessage('An unknown error occurred', 'error');
      }
      navigate(VENDOR.LOGIN);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  return (
    <>
      <UnifiedCalendar isVendor={true} vendorDetails={vendor} axiosInstance={axiosInstanceVendor} />
      <Footer />
    </>
  )
}

export default AvailableDate
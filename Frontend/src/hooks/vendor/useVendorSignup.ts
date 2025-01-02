import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VENDOR } from '../../config/constants/constants';
import { axiosInstanceVendor } from '../../config/api/axiosInstance';
import { showToastMessage } from '../../validations/common/toast';
import { validate } from '../../validations/vendor/vendorRegVal';
import { VendorFormValues } from '../../types/vendorTypes';
import { useSelector } from 'react-redux';
import VendorRootState from '../../redux/rootstate/VendorState';


const images = [
  '/images/login.webp',
  '/images/event1.jpg',
  '/images/event2.jpg'
];


const initialValues: VendorFormValues = {
  email: "",
  password: "",
  name: "",
  city: '',
  contactinfo: "",
  confirmPassword: "",
  companyName: "",
  about: "",
};


export const useVendorSignup = () => {
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendorData);
  const [formValues, setFormValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState<VendorFormValues>(initialValues);
  const [imageIndex, setImageIndex] = useState(0)
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendor) {
      navigate(VENDOR.DASHBOARD)
    }
  }, [navigate, vendor])


  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));

  };

  const handleNext = () => {
    if (activeStep < 1) {
      setActiveStep((cur) => cur + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((cur) => cur - 1);
    }
  };



  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const errors = validate(formValues);

    setFormErrors(errors)
    if (Object.values(errors).every((error) => error === "")) {
      
      axiosInstanceVendor
        .post("/signup", formValues, { withCredentials: true })
        .then((response) => {
          if (response.data.email) {
            showToastMessage('Otp send succesfully', 'success')
            localStorage.setItem('otpData', JSON.stringify({
              otpExpiry: response.data.otpExpiry,
              resendAvailableAt: response.data.resendAvailableAt,
              email: response.data.email
            }));
            navigate(`${VENDOR.VERIFY}`);
          }
        })
        .catch((error)=> {
          if(error.response?.status === 409) {
            showToastMessage('Email already Registered','error');
            setFormErrors(prev => ({
              ...prev,
              email :'Email already Registered'
            }))
          } else {
            showToastMessage(error.response?.data?.message || 'An error occured', 'success')
          }
        });
    }
  };

  return {
    formValues,
    formErrors,
    imageIndex,
    images,
    handleChange,
    submitHandler,
    activeStep,
    handleNext,
    handlePrev,
    isLastStep,
    isFirstStep,
    setIsLastStep,
    setIsFirstStep,
  };


}

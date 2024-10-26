import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserFormValues } from "../../types/userTypes";
import { useSelector } from 'react-redux';
import UserRootState from '../../redux/rootstate/UserState';
import { USER } from '../../config/constants/constants';
import { validate } from '../../validations/user/userVal';
import { CredentialResponse } from '@react-oauth/google';
import { axiosInstance } from '../../config/api/axiosInstance';
import { showToastMessage } from '../../validations/common/toast';


const initialValues: UserFormValues = {
    email: "",
    password: "",
    name: "",
    contactinfo: "",
    confirmPassword: "",
  };
  
const images = [
    '/images/userSignup1.jpg',
    '/images/userSignup2.jpg',
    '/images/userSignup3.jpg',
  ];



  export const useUserSignUp =()=>{
    const user = useSelector((state: UserRootState) => state.user.userData);
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [imageIndex, setImageIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
  
    useEffect(() => {
      if (user) {
        navigate(USER.HOME)
      }
    }, [navigate, user])
  
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };
      const togglePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
      };
      const togglePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
      };
  
    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
      axiosInstance
        .post('./google/register', { credential: credentialResponse.credential })
        .then((res) => {
          if (res.data.message) {
            showToastMessage(res.data.message, 'success')
            navigate(USER.LOGIN)
          }
        })
        .catch((error) => {
          showToastMessage(error.response?.data?.error || 'An error occurred during Google sign up', 'error')
        })
    };
  
  
    const submitHandler = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const errors = validate(formValues);
      setFormErrors(errors);
      if (Object.values(errors).every((error) => error === "")) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.post("/signup", formValues, {
            withCredentials: true
          });
          if (response.data.email) {
            showToastMessage('OTP sent successfully', 'success');
            localStorage.setItem('otpData', JSON.stringify({
              otpExpiry: response.data.otpExpiry,
              resendAvailableAt: response.data.resendAvailableAt,
              email: response.data.email
            }));
            navigate('/verify');
          }
        } catch (error) {
          console.error(error)
          showToastMessage( 'Failed to send OTP', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    }

    return {
        formValues,
        formErrors,
        images,
        imageIndex,
        isLoading,
        showPassword,
        showPassword1,
        showPassword2,
        handleChange,
        submitHandler,
        handleGoogleSuccess,
        togglePasswordVisibility,
        togglePasswordVisibility1,
        togglePasswordVisibility2,

  };
  
  }
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import { CredentialResponse } from '@react-oauth/google';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import UserRootState from '../../redux/rootstate/UserState';
import { useDisclosure } from '@nextui-org/react';
import { validateEmail } from '../../validations/user/userVal';
import { showToastMessage } from '../../validations/common/toast';
import { axiosInstance } from '../../config/api/axiosInstance';
import { USER } from '../../config/constants/constants';
import { loginValidationSchema } from '../../validations/common/loginValidate';
import { setUserInfo } from '../../redux/slices/UserSlice';


interface FormValues {
    email: string;
    password: string;
}
export interface ErrorResponse {
    message?: string;
    error?: string;
}

const initialValues: FormValues = {
    email: '',
    password: ''
}

const images = [
    '/images/userLogin1.jpg',
    '/images/userLogin2.jpg',
    '/images/userLogin3.jpg',

];


export const useLoginUser = () => {
    const user = useSelector((state: UserRootState) => state.user.userData);
    const [imageIndex, setImageIndex] = useState(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [emailError, setEmailError] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setForgotPasswordEmail(email)
        const errors = validateEmail({ email });
        setEmailError(errors.email);
    }
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };
  

    const handleForgotPassword = async () => {
        try {

            if (!forgotPasswordEmail.trim()) {
                showToastMessage('Please enter a valid email address', 'error')
                return
            }
            if (emailError) {
                showToastMessage(emailError, 'error')
                return
            }
            setIsLoading(true);
            const response = await axiosInstance.post('/forgot-password', {
                email: forgotPasswordEmail
            })
            showToastMessage(response.data.message, "success");
            onOpenChange();
            Swal.fire({
                title: 'Reset Link Sent!',
                text: 'A password reset link has been sent to your email. It will be active for the next 30 minutes.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                const errorMessage = axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    axiosError.message ||
                    "An error occurred while processing your request";
                showToastMessage(errorMessage, "error");
            } else {
                // This is an unknown error
                console.error('An unexpected error occurred:', error);
                showToastMessage("An unexpected error occurred", "error");
            }
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    };


    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate(USER.HOME);
        }
    }, [navigate, user]);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
        axiosInstance
            .post('/google/login', { credential: credentialResponse.credential })
            .then((response) => {
                localStorage.setItem('userToken', response.data.token);
                // localStorage.setItem('userRefresh', response.data.refreshToken);
                console.log(response);
                
                dispatch(setUserInfo(response.data.userData));
                showToastMessage(response.data.message, 'success')
                navigate(USER.HOME);
            })
            .catch((error) => {
                console.error(error);
                showToastMessage(error.response?.data?.message || 'An error occurred during Google login', 'error')
            });
    };

    const formik = useFormik({
        initialValues,
        validationSchema: loginValidationSchema,
        onSubmit: (values) => {
            if (Object.keys(formik.errors).length === 0) {
                axiosInstance
                    .post('/login', values)
                    .then((response) => {
                        localStorage.setItem('userToken', response.data.token);
                        // localStorage.setItem('userRefresh', response.data.refreshToken);
                        dispatch(setUserInfo(response.data.userData));
                        showToastMessage(response.data.message, 'success')
                        navigate(`${USER.HOME}`);
                    })
                    .catch((error) => {
                        console.error(error);
                        showToastMessage(error.response.data.message, 'error')
                    });
            } else {

                showToastMessage('Please correct the validation errors before submitting', 'error')
            }

        }
    })
    return {
        imageIndex,
        isOpen,
        onOpen, 
        onOpenChange,
        isLoading,
        images,
        formik,
        forgotPasswordEmail,
        emailError,
        showPassword,
        togglePasswordVisibility,
        handleForgotPassword,
        handleGoogleSuccess,
        handleEmailChange
    }


}




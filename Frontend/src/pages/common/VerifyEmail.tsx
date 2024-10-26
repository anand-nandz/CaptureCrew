import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Card, CardBody, Button, Typography } from "@material-tailwind/react";
import { axiosInstance, axiosSessionInstance } from '../../config/api/axiosInstance';
import axios from 'axios';
import { showToastMessage } from '../../validations/common/toast';
const images = [
  '/images/login.webp',
  '/images/event1.jpg',
  '/images/event2.jpg'
];

interface FormValues {
  otp: string;
}  
const VerifyEmail = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const otpData = localStorage.getItem('otpData');
    if (!otpData) {
      navigate('/signup');
      return;
    }

    const { otpExpiry, resendAvailableAt } = JSON.parse(otpData);

    const startTimer = () => {
      const now = Date.now();
      if (otpExpiry > now) {
        setTimeLeft(Math.floor((otpExpiry - now) / 1000));
        setResendDisabled(resendAvailableAt > now);

        const interval = setInterval(() => {
          const currentTime = Date.now();
          if (otpExpiry > currentTime) {
            setTimeLeft(Math.floor((otpExpiry - currentTime) / 1000));
            setResendDisabled(resendAvailableAt > currentTime);
          } else {
            setTimeLeft(0);
            setResendDisabled(false);
            clearInterval(interval);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        setTimeLeft(0);
        setResendDisabled(false);
      }
    };

    startTimer();
  }, [navigate]);

  const handleVerify = async (values: FormValues, { setSubmitting, setFieldError }: FormikHelpers<FormValues>) => {
    setIsLoading(true);
    try {
      const response = await axiosSessionInstance.post('/verify', { otp: values.otp });
      showToastMessage(response.data.message, 'success');
      if (response.data.user) {
        localStorage.removeItem('otpData');
        navigate('/login');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Invalid OTP';
        setFieldError('otp', errorMessage); // Set field error for formik
        showToastMessage(errorMessage, 'error'); // Display toast message
        if (error.response?.status === 400 && errorMessage === 'Session expired. Please sign up again.') {
          setTimeout(() => {
            navigate('/signup');
          }, 2000);
        }
      } else {
        showToastMessage('An unexpected error occurred. Please try again.', 'error');
      }

    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/resendOtp');
      const { otpExpiry, resendAvailableAt } = response.data;

      const otpData = JSON.parse(localStorage.getItem('otpData') || '{}');
      localStorage.setItem('otpData', JSON.stringify({
        ...otpData,
        otpExpiry,
        resendAvailableAt
      }));
      showToastMessage(response.data.message, 'success');
      setTimeLeft(Math.floor((otpExpiry - Date.now()) / 1000));
      setResendDisabled(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An error occurred while processing your request';
        showToastMessage(errorMessage, 'error');
      } else {
        console.error('Failed to resend OTP:', error);
        showToastMessage('An unexpected error occurred. Please try again.', 'error');
      }

    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .required('OTP is required')
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(4, 'Must be exactly 4 digits')
      .max(4, 'Must be exactly 4 digits')
  });

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">

      <div
        className={`${imageIndex % 2 === 0
          ? 'bg-gradient-to-r from-blue-600 to-indigo-900'
          : ''
          } w-full h-screen md:w-1/2 object-cover md:static absolute top-0 left-0 z-0 transition-all duration-1000 ease-in-out`}
        style={{
          backgroundImage: `url(${images[imageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Animated text */}
        <h1 className="animate-fadeIn text-4xl md:text-4xl text-white font-bold mt-20 mx-4 md:block hidden">
          Elevate Your Event Experience
        </h1>
        <p className="animate-slideIn text-xl md:text-2xl text-white font-normal mt-5 mx-4 md:block hidden">
          Find, Connect, and Collaborate with Top Event Planners
        </p>
      </div>

      <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} >

          <div className="w-full text-center mt-6 mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900">
              VERIFY OTP
            </h2>
          </div>

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={validationSchema}
            onSubmit={handleVerify}
          >
            {({ isSubmitting }) => (
              <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} >

                <Form className="space-y-4">
                  <div>
                    <Field
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={isLoading || isSubmitting}
                    />
                    <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {timeLeft !== null && (
                    <Typography className="text-center" color={timeLeft > 0 ? "blue-gray" : "red"}
                      placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
                      {timeLeft > 0
                        ? `Time remaining: ${formatTime(timeLeft)}`
                        : "OTP has expired"}
                    </Typography>
                  )}

                  <div className="flex justify-between gap-4">
                    <Button
                      type="button"
                      color="gray"
                      onClick={handleResend}
                      placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      disabled={isLoading || resendDisabled || isSubmitting}
                      className="bg-black"
                      fullWidth
                    >
                      {isLoading ? "Sending..." : "Resend OTP"}
                    </Button>

                    <Button
                      type="submit"
                      placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      disabled={isLoading || !timeLeft || timeLeft === 0 || isSubmitting}
                      className="bg-black"
                      fullWidth
                    >
                      {isSubmitting ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </Form>

              </CardBody>
            )}
          </Formik>

        </Card>
      </div>
    </div>




  );
};

export default VerifyEmail;
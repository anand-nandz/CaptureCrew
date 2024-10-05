import { useEffect, useState } from 'react';
import { Card, CardBody, Input, Button } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { axiosInstance, axiosInstanceVendor } from '../../config/api/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../../redux/slices/UserSlice';
import { setVendorInfo } from '../../redux/slices/VendorSlice';
import { showToastMessage } from '../../validations/common/toast';
import { USER, VENDOR } from '../../config/constants/constants';
import { validate } from '../../validations/common/otpValidation';

interface FormValues {
  otp: string;
}

const initialValues: FormValues = {
  otp: '',
};

const images = [
  '/images/login.webp',
  '/images/event1.jpg',
  '/images/event2.jpg'
];

const VerifyEmail = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      if (location.pathname === USER.VERIFY) {
        axiosInstance
          .post('/verify', values, { withCredentials: true })
          .then((response) => {
            dispatch(setUserInfo(response.data.user));
            showToastMessage(response.data.message, 'success');
            navigate(`${USER.HOME}`);
          })
          .catch((error) => {
            showToastMessage(error.response.data.error, 'error');
            console.error(error);
          });
      } else {
        axiosInstanceVendor
          .post('/verify', values, { withCredentials: true })
          .then((response) => {
            dispatch(setVendorInfo(response.data.user));
            showToastMessage(response.data.message, 'success');
            navigate(`${VENDOR.DASHBOARD}`);
          })
          .catch((error) => {
            showToastMessage(error.response.data.error, 'error');
            console.error(error);
          });
      }
    },
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
          <form onSubmit={formik.handleSubmit}>
            <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mr-3"
                >
                  OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  onChange={formik.handleChange}
                  value={formik.values.otp}
                  name="otp"
                  size="md"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                  autoComplete="off"
                  crossOrigin={undefined}
                  onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                />
                {formik.errors.otp && (
                  <p className="text-sm" style={{ color: 'red', marginTop: 5 }}>
                    {formik.errors.otp}
                  </p>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="gradient" fullWidth type="submit"
                  className="bg-black text-white mt-2 mb-4 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
                  Verify and Login
                </Button>
              </div>

            </CardBody>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;

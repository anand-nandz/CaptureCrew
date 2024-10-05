import React, { useEffect, useState } from 'react'
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { useSelector } from 'react-redux';
import UserRootState from '../../../redux/rootstate/UserState';
import { Link, useNavigate } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { validate } from '../../../validations/user/userRegVal';
import { axiosInstance } from '../../../config/api/axiosInstance';
import { showToastMessage } from '../../../validations/common/toast';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
const client_id = import.meta.env.VITE_CLIENT_ID || ''

interface UserFormValues {
  email: string;
  password: string;
  name: string;
  contactinfo: string;
  confirmPassword: string;
}

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

const SignUp = () => {
  const user = useSelector((state: UserRootState) => state.user.userData);
  const [formValues, setFormValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
  const [imageIndex, setImageIndex] = useState(0)

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
    setFormErrors(errors)
    if (Object.values(errors).every((error) => error === "")) {
      axiosInstance
        .post("/signup", formValues, { withCredentials: true })
        .then((response) => {
          if (response.data.email) {
            showToastMessage('Otp send succesfully', 'success')
            navigate(`${USER.VERIFY}`);
          }
        })
        .catch((error) => {
          showToastMessage(error.response.data.message, 'success')
        });
    }
  };

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
        <GoogleOAuthProvider clientId={client_id} >
          <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>

            <div className="w-full text-center mt-6 mb-4">
              <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Lemon, sans-serif' }}>
                SIGN UP
              </h2>
            </div>

            <form onSubmit={submitHandler}>
              <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mr-3">Name</label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    value={formValues.name}
                    name="name"
                    size="md"
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="name"
                  />
                  {formErrors.name ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input

                    id="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={formValues.email}
                    name="email"
                    size="md"
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="email"
                  />
                  {formErrors.email ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="contactinfo" className="block text-sm font-medium text-gray-700">Phone</label>
                  <Input

                    id="contactinfo"
                    type="text"
                    placeholder="Phone"
                    onChange={handleChange}
                    value={formValues.contactinfo}
                    name="contactinfo"
                    size="md"
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="contactinfo"
                  />
                  {formErrors.contactinfo ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.contactinfo}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Input

                    id="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formValues.password}
                    name="password"
                    size="md"
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="new-password"
                  />
                  {formErrors.password ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.password}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <Input

                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formValues.confirmPassword}
                    name="confirmPassword"
                    size="md"
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="new-password"
                  />
                  {formErrors.confirmPassword ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>

                <div className="flex justify-center mt-3">
                  <Button
                    type="submit" variant="gradient" placeholder={undefined}
                    className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                  >
                    Send OTP
                  </Button>
                </div>
              </CardBody>
            </form>

            <div className="flex justify-center mt-4">
              <GoogleLogin
                type='standard'
                theme='filled_black'
                size='medium'
                text='signup_with'
                shape='rectangular'
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log('Sign Up Failed');
                  showToastMessage('Google sign up failed', 'error');
                }}
              />
            </div>

            <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
              <Typography
                variant="small"
                className="mt-2 mb-4 flex justify-center"
                color="black"
                placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}        >
                Already have an account?
                <Link to={USER.LOGIN}>
                  <Typography
                    as="a"
                    href="#"
                    variant="small"
                    color="black"
                    className="ml-1 font-bold"
                    placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}            >
                    Login
                  </Typography>
                </Link>
              </Typography>
              <Typography
                variant="small"
                className="mt-3 flex justify-center pb-3"
                color="black"
                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                Are you a vendor?
                <Link to={VENDOR.SIGNUP}>
                  <Typography
                    as="a"
                    href="#signup"
                    variant="small"
                    color="black"
                    className="ml-1 font-bold"
                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}            >
                    Signup here
                  </Typography>
                </Link>
              </Typography>
            </CardFooter>
          </Card>
        </GoogleOAuthProvider>
      </div>

    </div>
  );
}

export default SignUp
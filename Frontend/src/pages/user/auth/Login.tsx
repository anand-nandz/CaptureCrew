import { useEffect, useState } from 'react'
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    CardFooter

} from "@material-tailwind/react";
import { useDispatch, useSelector } from 'react-redux';
import UserRootState from '../../../redux/rootstate/UserState';
import { Link, useNavigate } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { useFormik } from "formik";
import { axiosInstance } from '../../../config/api/axiosInstance';
import { setUserInfo } from '../../../redux/slices/UserSlice';
import { loginValidationSchema } from '../../../validations/common/loginValidate';
import { showToastMessage } from '../../../validations/common/toast';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

const client_id = import.meta.env.VITE_CLIENT_ID || ''


interface FormValues {
    email: string;
    password: string;
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

const UserLogin = () => {
    const user = useSelector((state: UserRootState) => state.user.userData);
    const [imageIndex, setImageIndex] = useState(0);
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
                localStorage.setItem('userRefresh', response.data.refreshToken);
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
                        localStorage.setItem('userRefresh', response.data.refreshToken);
                        dispatch(setUserInfo(response.data.userData));
                        showToastMessage(response.data.message, 'success')
                        navigate(`${USER.HOME}`);
                    })
                    .catch((error) => {
                        console.error(error);
                        showToastMessage(error.response.data.message, 'error')
                    });
            } else {
                // Validation errors exist, show toast or notification
                showToastMessage('Please correct the validation errors before submitting', 'error')
            }

        }
    })

    return (
        <div className="w-full h-screen flex flex-col md:flex-row items-start">


            <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
                <GoogleOAuthProvider clientId={client_id}>
                    <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <div className="w-full text-center mt-6 mb-4">
                            <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Lemon, sans-serif' }}>
                                LOGIN
                            </h2>
                        </div>

                        <form onSubmit={formik.handleSubmit}>
                            <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        name="email"
                                        size="md"
                                        crossOrigin={undefined}
                                        autoComplete="email"
                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                                        onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-sm" style={{ color: 'red' }}>
                                            {formik.errors.email}
                                        </p>
                                    )}

                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        name="password"
                                        size="md"
                                        crossOrigin={undefined}
                                        onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                                        autoComplete="new-password"
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-sm" style={{ color: 'red' }}>
                                            {formik.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center mt-4">
                                    <Button
                                        type="submit"
                                        onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} placeholder={undefined}
                                        className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            </CardBody>
                        </form>

                        <div className="flex justify-center mt-4">
                            <GoogleLogin
                                type='standard'
                                theme='filled_black'
                                size='medium'
                                text='signin_with'
                                shape='rectangular'
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    console.log('Login Failed');
                                    showToastMessage('Google login failed', 'error');
                                }}
                            />
                        </div>


                        <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <Typography
                                variant="small"
                                className="mt-2 mb-4 flex justify-center"
                                color="black"
                                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                                Don't have an account?
                                <Link to={USER.SIGNUP}>
                                    <Typography
                                        as="a"
                                        href="#"
                                        variant="small"
                                        color="black"
                                        className="ml-1 font-bold"
                                        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}            >
                                        Sign Up
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




        </div>
    )
}


export default UserLogin;
import { useEffect, useState } from 'react'
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    CardFooter

} from "@material-tailwind/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    
} from "@nextui-org/react";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { USER,VENDOR } from '../../../config/constants/constants';
import { useFormik } from "formik";
import { Eye, EyeOff } from 'lucide-react';
import { axiosInstanceVendor } from '../../../config/api/axiosInstance';
import { setVendorInfo } from '../../../redux/slices/VendorSlice';
import { loginValidationSchema } from '../../../validations/common/loginValidate';
import { showToastMessage } from '../../../validations/common/toast';
import VendorRootState from '../../../redux/rootstate/VendorState';
import { ErrorResponse, useLoginUser } from '../../../hooks/user/useLoginUser';
import { useDisclosure } from '@nextui-org/react';
import { validateEmail } from '../../../validations/user/userVal';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { IFormValues } from '@/utils/interfaces';



const initialValues: IFormValues = {
    email: '',
    password: ''
}

const images = [
    '/images/userLogin1.jpg',
    '/images/userLogin2.jpg',
    '/images/userLogin3.jpg',

];

const VendorLogin = () => {
    const vendor = useSelector((state: VendorRootState) => state.vendor.vendorData);
    const [imageIndex, setImageIndex] = useState(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [emailError, setEmailError] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {showPassword,togglePasswordVisibility} = useLoginUser()

    useEffect(() => {
        if (vendor) {
            navigate(VENDOR.DASHBOARD);
        }
    }, [navigate, vendor]);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setForgotPasswordEmail(email)
        const errors = validateEmail({ email });
        setEmailError(errors.email);
    }

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
            const response = await axiosInstanceVendor.post('/forgot-password', {
                email: forgotPasswordEmail
            })
            showToastMessage(response.data.message, "success");
            onOpenChange();
            Swal.fire({
                title: 'Reset Link Sent!',
                text: 'A password reset link has been sent to your email. It will be active for the next 5 minutes.',
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


    const formik = useFormik({
        initialValues,
        validationSchema: loginValidationSchema,
        onSubmit: (values) => {
            if (Object.keys(formik.errors).length === 0) {
                axiosInstanceVendor
                    .post('/login', values)
                    .then((response) => {
                        localStorage.setItem('vendorToken', response.data.token);
                        // localStorage.setItem('vendorRefresh', response.data.refreshToken);
                        console.log(response.data.vendor,'vendorrrrrrrrrrrrrrr');
                        
                        dispatch(setVendorInfo(response.data.vendor));
                        showToastMessage(response.data.message, 'success')
                        navigate(`${VENDOR.DASHBOARD}`);
                    })
                    .catch((error) => {
                        console.error(error,'eroro iin login vendor ');
                        const errorMessage = error.response?.data?.message || 'An error occurred during login';
                        showToastMessage(errorMessage, 'error')
                    });
            } else {
                showToastMessage('Please correct the validation errors before submitting', 'error')
            }

        }
    })

    return (
        <div className="w-full h-screen flex flex-col md:flex-row items-start">
            <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">

                <Card className="w-full max-w-md overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <div className="w-full text-center mt-6 mb-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Lemon, sans-serif' }}>
                            VENDOR LOGIN
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
                                <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
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
                                <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    </div>
                                {formik.touched.password && formik.errors.password && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {formik.errors.password}
                                    </p>
                                )}
                            </div>
                            <Typography
                                    className="text-left cursor-pointer"
                                    onClick={onOpen}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    placeholder={undefined}
                                >
                                    Forgot password?
                                </Typography>

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



                    <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <Typography
                            variant="small"
                            className="mt-2 mb-4 flex justify-center"
                            color="black"
                            placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                            Don't have an account?
                            <Link to={VENDOR.SIGNUP}>
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
                            className="mt-3 flex justify-center"
                            color="black"
                            placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                            Are you a User?
                            <Link to={USER.LOGIN}>
                                <Typography
                                    as="a"
                                    href="#signup"
                                    variant="small"
                                    color="black"
                                    className="ml-1 font-bold pb-3"
                                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}            >
                                    SignIn here
                                </Typography>
                            </Link>
                        </Typography>
                    </CardFooter>

                </Card>


            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                size="sm"
                classNames={{
                    base: "bg-white rounded-lg ",
                    header: "border-b border-gray-200",
                    body: "py-6",
                    closeButton: "hidden",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <ModalHeader className="flex flex-col items-center justify-center text-xl font-semibold">
                                Forgot Password
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4 ">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={forgotPasswordEmail}
                                            crossOrigin={undefined}
                                            onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                            onChange={handleEmailChange}
                                            className="w-full"
                                            autoComplete='email'
                                            error={!!emailError}

                                        />
                                        {emailError ? (
                                            <p
                                                className="text-sm"
                                                style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                                            >
                                                {emailError}
                                            </p>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-between space-x-4">
                                <Button
                                    className="flex-1 font-judson bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                    onClick={onClose} disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex font-judson bg-black text-white hover:bg-gray-900"
                                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                    onClick={handleForgotPassword} disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <span className="mr-2">Sending...</span>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        </div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

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


export default VendorLogin;
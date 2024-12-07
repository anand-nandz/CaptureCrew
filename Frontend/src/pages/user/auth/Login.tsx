import {
    Card,
    CardBody,
    Typography,
    Button,
    Input as MaterialInput, InputProps,
    CardFooter,

} from "@material-tailwind/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,

} from "@nextui-org/react";
import { Link, useNavigate } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { useLoginUser } from "../../../hooks/user/useLoginUser";
import { showToastMessage } from "../../../validations/common/toast";
import { useEffect } from "react";

const client_id = import.meta.env.VITE_CLIENT_ID || ''

type CustomInputProps = Omit<InputProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture' | 'crossOrigin'>;

const Input: React.FC<CustomInputProps> = (props) => {
    return (
        <MaterialInput
            {...props}
            // Explicitly set these as undefined to satisfy both TypeScript and runtime
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
        />
    );
};

const UserLogin: React.FC = () => {
    const {

        user, imageIndex, images, isLoading, formik, forgotPasswordEmail, emailError, isOpen, showPassword,
        onOpen, onOpenChange, togglePasswordVisibility, handleEmailChange, handleForgotPassword, handleGoogleSuccess
    } = useLoginUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate(USER.HOME);
        }
    }, [navigate, user]);

    if (isLoading) {
        return <Loader />
    }

    return (
        <div className="w-full h-screen flex flex-col md:flex-row items-start">


            <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
                <GoogleOAuthProvider clientId={client_id}>
                    <Card className="w-full max-w-md overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <div className="w-full text-center mt-6 mb-4">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: 'Lemon, sans-serif' }}>
                                LOGIN
                            </h2>
                        </div>

                        <form onSubmit={formik.handleSubmit}>
                            <CardBody className="flex flex-col gap-4 px-4 pb-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
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
                                        autoComplete="email"
                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-sm" style={{ color: 'red' }}>
                                            {formik.errors.email}
                                        </p>
                                    )}

                                </div>
                                <div className="relative">
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

                                <div className="flex justify-center mt-2">
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
                                className="mt-2 mb-2 flex justify-center"
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
                                className="mt-2 flex justify-center pb-3"
                                color="black"
                                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                                Are you a vendor?
                                <Link to={VENDOR.LOGIN}>
                                    <Typography
                                        as="a"
                                        href="#signup"
                                        variant="small"
                                        color="black"
                                        className="ml-1 font-bold"
                                        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}            >
                                        SignIn here
                                    </Typography>
                                </Link>
                            </Typography>
                        </CardFooter>

                    </Card>
                </GoogleOAuthProvider>


            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                size="sm"
                classNames={{
                    base: "bg-white rounded-lg shadow-lg",
                    header: "border-b border-gray-200",
                    body: "py-7",
                    closeButton: "hidden",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <ModalHeader className="flex flex-col  items-center justify-center text-xl font-semibold text-black">
                                Forgot Password
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4 font-judson">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={forgotPasswordEmail}
                                            onChange={handleEmailChange}
                                            className="w-full "
                                            autoComplete="email"
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
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex font-judson bg-black text-white hover:bg-gray-900"
                                    onClick={handleForgotPassword}
                                    placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                    disabled={isLoading}
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
                className={`${imageIndex % 2 === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-900' : ''} w-full h-screen md:w-1/2 object-cover md:static absolute top-0 left-0 z-0 transition-all duration-1000 ease-in-out`}
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
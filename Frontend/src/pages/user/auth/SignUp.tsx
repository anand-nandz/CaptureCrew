import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Spinner
} from "@material-tailwind/react";
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { showToastMessage } from '../../../validations/common/toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useUserSignUp } from '../../../hooks/user/useUserSignup';

const client_id = import.meta.env.VITE_CLIENT_ID || ''

const SignUp = () => {

  const { formValues, formErrors, imageIndex, images, isLoading, showPassword, showPassword1, handleChange, submitHandler, handleGoogleSuccess, togglePasswordVisibility, togglePasswordVisibility1 } = useUserSignUp()

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
          Find, Connect, and Collaborate
        </p>
      </div>


      <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <GoogleOAuthProvider clientId={client_id} >
          <Card className="w-full max-w-md overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>

            <div className="w-full text-center mt-6 mb-4">
              <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Lemon, sans-serif' }}>
                SIGN UP
              </h2>
            </div>

            <form onSubmit={submitHandler} >
              <CardBody className="flex flex-col gap-4 px-4 pb-0" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
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

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={handleChange}
                      value={formValues.password}
                      name="password"
                      size="md"
                      crossOrigin={undefined}
                      onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md pr-10"
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
                  {formErrors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Input

                      id="confirm-password"
                      type={showPassword1 ? "text" : "password"}
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
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={togglePasswordVisibility1}
                    >
                      {showPassword1 ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>

                <div className="flex justify-center mt-2">
                  <Button
                    type="submit"
                    variant="gradient"
                    onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} placeholder={undefined}
                    className="bg-black text-white mt-1 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              </CardBody>
            </form>

            <div className="flex justify-center mt-2">
              <GoogleLogin
                type='standard'
                theme='filled_black'
                size='medium'
                text='signup_with'
                shape='rectangular'
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  showToastMessage('Google sign up failed', 'error');
                }}
              />
            </div>

            <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
              <Typography
                variant="small"
                className="mt-2 mb-2 flex justify-center"
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
                className="mt-1 flex justify-center pb-2"
                color="black"
                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
                Would you like to be a vendor?
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
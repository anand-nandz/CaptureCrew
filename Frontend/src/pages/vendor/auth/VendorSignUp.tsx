import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Stepper,
  Step,
} from "@material-tailwind/react";
import { Link } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { useVendorSignup } from '../../../hooks/vendor/useVendorSignup';

const VendorSignUp = () => {

  const { formValues, formErrors, images, imageIndex, handleChange, submitHandler, activeStep, handleNext, handlePrev, isLastStep, isFirstStep, setIsLastStep, setIsFirstStep } = useVendorSignup();

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

        <Card className="w-full max-w-md overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>

          <div className="w-full text-center mt-6 mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Lemon, sans-serif' }}>
              VENDOR SIGN UP
            </h2>
          </div>


          <Stepper
            activeStep={activeStep}
            isLastStep={(value) => setIsLastStep(value)}
            isFirstStep={(value) => setIsFirstStep(value)}
            className='hidden'
            placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
          >
            <Step onClick={() => { }} className="h-4 w-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>1</Step>
            <Step onClick={() => { }} className="h-4 w-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>2</Step>
          </Stepper>



          <form onSubmit={submitHandler}>
            <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
              {activeStep === 0 && (
                <>
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

                </>

              )}

              {activeStep === 1 && (
                <>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <Input

                      id="companyName"
                      type="text"
                      placeholder="Company Name"
                      onChange={handleChange}
                      value={formValues.companyName}
                      name="companyName"
                      size="md"
                      crossOrigin={undefined}
                      onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                      autoComplete="companyName"
                    />
                    {formErrors.companyName ? (
                      <p
                        className="text-sm"
                        style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                      >
                        {formErrors.companyName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                    <Input

                      id="about"
                      type="text"
                      placeholder="About"
                      onChange={handleChange}
                      value={formValues.about}
                      name="about"
                      size="md"
                      crossOrigin={undefined}
                      onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                      autoComplete="about"
                    />
                    {formErrors.about ? (
                      <p
                        className="text-sm"
                        style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                      >
                        {formErrors.about}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="City" className="block text-sm font-medium text-gray-700">City</label>
                    <Input

                      id="city"
                      type="text"
                      placeholder="city"
                      onChange={handleChange}
                      value={formValues.city}
                      name="city"
                      size="md"
                      crossOrigin={undefined}
                      onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                      autoComplete="city"
                    />
                    {formErrors.city ? (
                      <p
                        className="text-sm"
                        style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                      >
                        {formErrors.city}
                      </p>
                    ) : null}
                  </div>
                </>
              )}

              <div className="flex justify-between mt-2">
                {!isFirstStep && (
                  <Button
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    placeholder={undefined}
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                  >
                    Prev
                  </Button>
                )}

                {isFirstStep && <div></div>}

                {!isLastStep ? (
                  <Button
                    onClick={handleNext}
                    className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ml-2" // Add margin-left for spacing
                    placeholder={undefined}
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    placeholder={undefined}
                    className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ml-2" // Add margin-left for spacing
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                  >
                    Send OTP
                  </Button>
                )}

              </div>
            </CardBody>
          </form>

          <CardFooter className="pt-5" placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}>
            <Typography
              variant="small"
              className="mt-2 mb-4 flex justify-center"
              color="black"
              placeholder={undefined} onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }}        >
              Already have an account?
              <Link to={VENDOR.LOGIN}>
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
              Are you a User?
              <Link to={USER.SIGNUP}>
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

      </div>

    </div>
  );
}

export default VendorSignUp;
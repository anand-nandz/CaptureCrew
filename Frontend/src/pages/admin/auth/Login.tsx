import { useEffect, useState } from 'react'
import {
    Card,
    CardBody,
    Button,
    Input,

} from "@material-tailwind/react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ADMIN } from '../../../config/constants/constants';
import { useFormik } from "formik";
import { axiosInstanceAdmin } from '../../../config/api/axiosInstance';
import { loginValidationSchema } from '../../../validations/common/loginValidate';
import { showToastMessage } from '../../../validations/common/toast';
import AdminRootState from '../../../redux/rootstate/AdminState';
import { Eye, EyeOff } from 'lucide-react';
import { setAdminInfo } from '../../../redux/slices/AdminSlice';


interface FormValues {
    email: string;
    password: string;
}

const initialValues: FormValues = {
    email: '',
    password: ''
}

const images = [
    '/images/logo1.png',
    '/images/logo2.png',
    '/images/logo3.png',
];

const Login = () => {
    const admin = useSelector((state: AdminRootState) => state.admin.adminData);
    const [imageIndex, setImageIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (admin) {
            navigate(`/admin${ADMIN.DASHBOARD}`);
        }
    }, [navigate, admin]);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };


    const formik = useFormik({
        initialValues,
        validationSchema: loginValidationSchema,
        onSubmit: (values) => {
            if (Object.keys(formik.errors).length === 0) {                
                axiosInstanceAdmin
                    .post('/login', values)
                    .then((response) => {
                        localStorage.setItem('adminToken', response.data.token);                        
                        dispatch(setAdminInfo(response.data.adminData));
                        showToastMessage(response.data.message, 'success')
                        navigate(`/admin${ADMIN.DASHBOARD}`);
                    })
                    .catch((error) => {
                        console.error(error,'error in login vendor ');
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

                <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden" shadow={false} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <div className="w-full text-center mt-6 mb-4">
                        <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Lemon, sans-serif' }}>
                            ADMIN LOGIN
                        </h2>
                    </div>

                    <form onSubmit={formik.handleSubmit} >
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
                            <div className='relative'>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className='relative'>
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

                            <div className="flex justify-center mt-4 p-4">
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



                   

                </Card>


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
               
            </div>




        </div>
    )
}


export default Login;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Card,
    CardBody,
    Input,
    Button,
} from "@material-tailwind/react";
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { axiosInstance, axiosInstanceVendor } from '../../../config/api/axiosInstance';
import { showToastMessage } from '../../../validations/common/toast';
import { validatePassword } from '../../../validations/user/userVal';
import { USER, VENDOR } from '../../../config/constants/constants';
import Swal from 'sweetalert2'
import Loader from '../../../components/common/Loader';
import { ResetFormValues } from '@/utils/interfaces';

const initialValues: ResetFormValues = {
    password: "",
    confirmPassword: "",
};

const ResetPassword: React.FC = () => {
    const [formValues, setFormValues] = useState(initialValues)
    const [formErrors, setFormErrors] = useState<ResetFormValues>(initialValues);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isVendor = location.pathname.includes('vendor');
    const axiosClient = isVendor ? axiosInstanceVendor : axiosInstance;
    const redirectPath = isVendor ? VENDOR.LOGIN : USER.LOGIN;



    const validateToken = async () => {
        try {

            const response = await axiosClient.get(`/validate-reset-token/${token}`);
            console.log(response);

            setIsTokenValid(response.data.isValid);
        } catch (error) {
            console.log(error, 'error')
            Swal.fire({
                title: 'Error!',
                text: 'Invalid or expired reset token',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/login')
            })
            setIsTokenValid(false)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            validateToken();
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });

        const errors = validatePassword({ ...formValues, [name]: value })
        setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validatePassword(formValues)
        setFormErrors(errors);

        if (Object.values(errors).every((error) => error === "")) {
            setIsLoading(true);
            try {
                await validateToken()
                if (!isTokenValid) {
                    showToastMessage('Session has expired. Please request a new password reset.', 'error');
                    navigate(redirectPath);
                    return;
                }
                await axiosClient.post(`/reset-password/${token}`, formValues, { withCredentials: true });
                showToastMessage('Password successfully reset', 'success');
                navigate(redirectPath); // Redirect to login page
            } catch (error) {
                console.error(error)
                showToastMessage('Failed to reset password', 'error');
            } finally {
                setIsLoading(false);
            }
        }

    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (!isTokenValid) {
        return null
    }
    return (
        <div className="flex justify-center items-center h-screen bg-cover bg-center"> 
            <Card className="w-full max-w-md overflow-hidden bg-transparent shadow-lg " placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>


                <div className="w-full text-center my-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: 'Lemon, sans-serif' }}>
                        Reset Your Password
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <CardBody className="flex flex-col gap-4 px-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <Input

                                    id="newpassword"
                                    type={showPassword ? "text" : "password"}
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
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <Eye className="h-4 w-4 text-gray-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                                </button>
                            </div>
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
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="relative">
                                <Input

                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
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
                                    onClick={() => setShowConfirmPassword(showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                     {showConfirmPassword ? <Eye className="h-4 w-4 text-gray-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
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

                        <Button
                            type="submit"
                            variant="gradient"
                            onPointerEnterCapture={() => { }} onPointerLeaveCapture={() => { }} placeholder={undefined}
                            className="bg-black mb-5 text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Reseting Password...
                                </>
                            ) : (
                                "Reset password"
                            )}
                        </Button>

                    </CardBody>
                </form>
            </Card>
        </div >
    );
};

export default ResetPassword;
import { useEffect, useCallback } from "react"
import { axiosInstance,axiosInstanceVendor } from "../../config/api/axiosInstance"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout as userLogout } from "../../redux/slices/UserSlice";
import { logout as vendorLogout } from "../../redux/slices/VendorSlice";
import Swal from 'sweetalert2';
import { USER,VENDOR } from "../../config/constants/constants"
import { AxiosError } from "axios";
interface ApiErrorData {
    message: string;
}

interface ApiErrorResponse {
    data: ApiErrorData;
    status: number;
}

type RouteType = 'user' | 'vendor' | 'admin';
export const useBlockCheck =(routeType : RouteType) =>{
    
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleBlockedUser = useCallback( async(type: RouteType)=>{
        if(routeType=== 'admin') return
        const logoutAction = type === 'user' ? userLogout : vendorLogout;
        const tokenKey = `${type}Token`;
        const refreshTokenKey = `${type}Refresh`;

        localStorage.removeItem(tokenKey)
        localStorage.removeItem(refreshTokenKey)
        dispatch(logoutAction())

        await Swal.fire({
            title: 'Account Blocked',
            text: 'Your account has been blocked by the administrator.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
         navigate(type === 'user' ? USER.LOGIN : VENDOR.LOGIN);
    },[dispatch,navigate])

    useEffect(() => {
        if(routeType=== 'admin') return
        const checkBlockStatus = async () => {
            try {
                const axiosInstanceToUse = 
                    routeType === 'user' ? axiosInstance : axiosInstanceVendor 
                
                await axiosInstanceToUse.get('/check-block-status');
            } catch (error) {
                if (error instanceof AxiosError) {
                    const axiosError = error as AxiosError<ApiErrorData, ApiErrorResponse>;
                    if (axiosError.response?.status === 403 && 
                        axiosError.response?.data?.message === 'Blocked by Admin') {
                        await handleBlockedUser(routeType);
                    }
                }
            }
        }

        checkBlockStatus()

        const intervalId = setInterval(checkBlockStatus, 3000);
        return () => clearInterval(intervalId)
    }, [routeType, handleBlockedUser]);
    
    return null

}
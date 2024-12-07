// hooks/useBlockCheck.ts
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserRootState from '@/redux/rootstate/UserState';
import VendorRootState from '@/redux/rootstate/VendorState';
import { axiosInstance, axiosInstanceVendor } from '@/config/api/axiosInstance';
import { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { USER, VENDOR } from '@/config/constants/constants';
import { logout as userLogout } from '@/redux/slices/UserSlice';
import { logout as vendorLogout } from '@/redux/slices/VendorSlice';

export const useBlockCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();
  const dispatch = useDispatch();
    const userSignedIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);
    const vendorSignedIn = useSelector((state: VendorRootState) => state.vendor.isVendorSignedIn);

    const handleBlockedAccount = async (type: 'user' | 'vendor') => {
        const result = await Swal.fire({
          title: 'Account Blocked',
          text: 'Your account has been blocked by the administrator.',
          icon: 'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
    
        if (result.isConfirmed) {
          const tokenKey = `${type}Token`;
          const refreshTokenKey = `${type}Refresh`;
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshTokenKey);
    
          if (type === 'user') {            
            dispatch(userLogout());
            navigate(USER.LOGIN);
        } else {            
            dispatch(vendorLogout());
            navigate(VENDOR.LOGIN);
        }
        }
      };
    

    const checkBlockStatus = async () => {
        try {
            if (location.pathname.startsWith('/vendor') && vendorSignedIn) {
                const response = await axiosInstanceVendor.get('/check-block-status');
                console.log(response.data.isBlocked,'response block');
                if (response.data.isBlocked) {
                    await handleBlockedAccount('vendor');
                  }
            } else if (!location.pathname.startsWith('/admin') && 
                      !location.pathname.startsWith('/vendor') && 
                      userSignedIn) {
                const response = await axiosInstance.get('/check-block-status');
                console.log(response.data.isBlocked,'in blockcheck');
               
                if (response.data.isBlocked===true) {
                    
                    await handleBlockedAccount('user');
                  }
            }
                   
        } catch (error) {
            console.error('Block check failed:', error);
            if (error instanceof AxiosError) {
            if (error?.response?.status === 403 && 
                error?.response?.data?.message === 'Blocked by Admin') {
                const accountType = location.pathname.startsWith('/vendor') ? 'vendor' : 'user';
          await handleBlockedAccount(accountType);
            }
        }
        }
    };

    useEffect(() => {
        if (userSignedIn || vendorSignedIn) {
            checkBlockStatus();
        }
    }, [location.pathname, userSignedIn, vendorSignedIn]);
};




// import { useEffect, useCallback } from "react"
// import { axiosInstance,axiosInstanceVendor } from "../../config/api/axiosInstance"
// import { useDispatch } from "react-redux"
// import { useNavigate } from "react-router-dom"
// import { logout as userLogout } from "../../redux/slices/UserSlice";
// import { logout as vendorLogout } from "../../redux/slices/VendorSlice";
// import Swal from 'sweetalert2';
// import { USER,VENDOR } from "../../config/constants/constants"
// import { AxiosError } from "axios";
// interface ApiErrorData {
//     message: string;
// }

// interface ApiErrorResponse {
//     data: ApiErrorData;
//     status: number;
// }

// type RouteType = 'user' | 'vendor' | 'admin';
// export const useBlockCheck =(routeType : RouteType) =>{
    
//     const dispatch = useDispatch()
//     const navigate = useNavigate()

//     const handleBlockedUser = useCallback( async(type: RouteType)=>{
//         if(routeType=== 'admin') return
//         const logoutAction = type === 'user' ? userLogout : vendorLogout;
//         const tokenKey = `${type}Token`;
//         const refreshTokenKey = `${type}Refresh`;

//         localStorage.removeItem(tokenKey)
//         localStorage.removeItem(refreshTokenKey)
//         dispatch(logoutAction())

//         await Swal.fire({
//             title: 'Account Blocked',
//             text: 'Your account has been blocked by the administrator.',
//             icon: 'error',
//             confirmButtonText: 'OK'
//         });
//          navigate(type === 'user' ? USER.LOGIN : VENDOR.LOGIN);
//     },[dispatch,navigate])

//     useEffect(() => {
//         if(routeType=== 'admin') return
//         const checkBlockStatus = async () => {
//             try {
//                 const axiosInstanceToUse = 
//                     routeType === 'user' ? axiosInstance : axiosInstanceVendor 
//                 console.log(axiosInstanceToUse,'useblock axixo instaane used');
                
//                 await axiosInstanceToUse.get('/check-block-status');
//             } catch (error) {
//                 if (error instanceof AxiosError) {
//                     const axiosError = error as AxiosError<ApiErrorData, ApiErrorResponse>;
//                     if (axiosError.response?.status === 403 && 
//                         axiosError.response?.data?.message === 'Blocked by Admin') {
//                         await handleBlockedUser(routeType);
//                     }
//                 }
//             }
//         }

//         checkBlockStatus()

//         const intervalId = setInterval(checkBlockStatus, 100000);
//         return () => clearInterval(intervalId)
//     }, [routeType, handleBlockedUser]);
    
//     return null

// }
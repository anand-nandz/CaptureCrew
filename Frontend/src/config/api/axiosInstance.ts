import axios from "axios";

import { CreateAxiosInstance } from "../../types/axioxTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const createAxiosInstance : CreateAxiosInstance = (baseUrl ,tokenKey,refreshTokenKey)=>{
    const instance = axios.create({
        baseURL : baseUrl
    })

    instance.interceptors.request.use(
        (config)=> {
            const token = localStorage.getItem(tokenKey);
            if(token){
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.request.use(
        (response)=>response,
        async(error)=>{
            if(error.response.status === 401 && error.resource.data.message  === 'Invalid token'){
                try {
                    const refreshToken = localStorage.getItem(refreshTokenKey);
                    const refreshResponse = await instance.post('/refresh-token',{refreshToken});
                    const newToken = refreshResponse.data.token
                    localStorage.setItem(tokenKey,newToken)

                    error.config.headers.Authorization = `Bearer ${newToken}`
                } catch (refreshError) {
                    console.error('Error refreshing token',refreshError);
                    return Promise.reject(refreshError)  
                }
            }
            return Promise.reject(error)
        }
    )
    return instance

}


export const axiosInstance = createAxiosInstance(`${BASE_URL}/api/user`,'userToken','userRefresh') ;
export const axiosInstanceVendor = createAxiosInstance(`${BASE_URL}/api/vendor`,'vendorToken','vendorRefresh') ;
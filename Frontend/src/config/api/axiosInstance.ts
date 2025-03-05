
import axios, { AxiosInstance } from "axios";
import { CreateAxiosInstance } from "../../types/axioxTypes";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const createAxiosInstance: CreateAxiosInstance = (baseUrl, tokenKey, refreshTokenKey) => {
    const instance = axios.create({
        baseURL: baseUrl,
        withCredentials: true,
    });
    

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(tokenKey);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,        
        async (error) => {
            if (error.response) {
                if (error.response.status === 403 && error.response.data.message === 'Blocked by Admin') {
                    localStorage.removeItem(tokenKey);
                    localStorage.removeItem(refreshTokenKey);
                    return Promise.reject(error);
                }
                

                if (error.response?.status === 401) {
                    if (error.response.data.expired) {
                        try {
                            const refreshResponse = await instance.post('/refresh-token',{},{withCredentials:true});
                            const newToken = refreshResponse.data.token;                            
                            localStorage.setItem(tokenKey, newToken);
                            console.log(refreshResponse.data,'refresh res data');
                            
                            error.config.headers.Authorization = `Bearer ${newToken}`;
                            return instance(error.config);

                        } catch (refreshError) {
                            localStorage.removeItem(tokenKey);
                            localStorage.removeItem(refreshTokenKey);
                            const result = await Swal.fire({
                                title: 'Session Expired',
                                text: 'Your session has expired. Please login again to continue.',
                                icon: 'warning',
                                confirmButtonText: 'Login',
                                allowOutsideClick: false,
                            });
                            if(result.isConfirmed){
                                
                                window.location.href = baseUrl.includes('/vendor') 
                                    ? '/login' 
                                    : baseUrl.includes('/admin')
                                        ? '/admin'
                                        : '/vendor/login';
                            }
                            return Promise.reject(refreshError);
                        }
                    } else if (error.response.data.message === 'Session expired') {
                        window.location.href = baseUrl.includes('/vendor') ? '/vendor/login' : '/login';
                        return Promise.reject(error);
                    } 
                    
                }

                if(error.response.status === 404){
                    window.location.href = '/*';
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );
   
    

    return instance;
};

export const axiosInstance = createAxiosInstance(`${BASE_URL}/api/user`, 'userToken', 'userRefresh');
export const axiosInstanceAdmin = createAxiosInstance(`${BASE_URL}/api/admin`, 'adminToken', 'adminRefresh');
export const axiosInstanceVendor = createAxiosInstance(`${BASE_URL}/api/vendor`, 'vendorToken', 'vendorRefresh');
export const axiosInstanceChat = createAxiosInstance(`${BASE_URL}/api/conversations`, 'userToken', 'userRefresh');
export const axiosInstanceMessage = createAxiosInstance(`${BASE_URL}/api/messages`, 'userToken', 'userRefresh');


export const axiosSessionInstance: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/user`,
    withCredentials: true,
});

axiosSessionInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && error.response.data.message === 'Session expired') {
            window.location.href = '/signup';
        }
        return Promise.reject(error);
    }
);


export const axiosSessionInstanceV: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/vendor`,
    withCredentials: true,
});

axiosSessionInstanceV.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && error.response.data.message === 'Session expired') {
            window.location.href = '/signup';
        }
        return Promise.reject(error);
    }
);
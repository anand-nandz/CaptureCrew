
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
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                if (error.response.status === 401) {
                    if (error.response.data.expired) {
                        try {
                            // const refreshToken = localStorage.getItem(refreshTokenKey);

                            const refreshResponse = await instance.post('/refresh-token');
                            const newToken = refreshResponse.data.token;
                            console.log(newToken, "newToken in refresh");

                            localStorage.setItem(tokenKey, newToken);

                            error.config.headers.Authorization = `Bearer ${newToken}`;
                            return instance(error.config);
                        } catch (refreshError) {
                            console.error('Error refreshing token', refreshError);
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
                                window.location.href = '/login';
                            }
                            return Promise.reject(refreshError);
                        }
                    } else if (error.response.data.message === 'Session expired') {
                        // Handle session expiration
                        console.log('Session expired. Redirecting to login...');
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }
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


export const axiosSessionInstance: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/user`,
    withCredentials: true,
});

axiosSessionInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && error.response.data.message === 'Session expired') {
            console.log('Session expired. Redirecting to signup...');
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
            console.log('Session expired. Redirecting to signup...');
            window.location.href = '/signup';
        }
        return Promise.reject(error);
    }
);
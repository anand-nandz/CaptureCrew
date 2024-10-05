import { AxiosInstance } from 'axios';


export type CreateAxiosInstance = (
    baseUrl: string,
    tokenKey: string,
    refreshTokenKey: string
  ) => AxiosInstance;
  
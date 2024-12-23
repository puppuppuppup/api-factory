import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export type HttpConfig = {
    baseUrl: string;
    tokenName?: string;
};

export class HttpInstanceFactory {
    public static getInstance(httpConfig: HttpConfig): AxiosInstance {
        const httpInstance = axios.create({
            baseURL: httpConfig.baseUrl,
        });
        if (httpConfig.tokenName) {
            httpInstance.interceptors.request.use(config => {
                const token = Cookies.get(httpConfig.tokenName as string);

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    delete config.headers.Authorization;
                }
                return config;
            });
        }
        return httpInstance;
    }
}

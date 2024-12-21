import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export type HttpInstanceOptions = {
    baseUrl: string;
    tokenName: string
}

export class HttpInstanceFactory {
    private static httpInstance: AxiosInstance | null = null;

    public static getInstance(options: HttpInstanceOptions) {
        if (!this.httpInstance) {
            this.httpInstance = axios.create({
                baseURL: options.baseUrl,
            });
            this.httpInstance.interceptors.request.use(config => {
                const token = Cookies.get(options.tokenName);

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    delete config.headers.Authorization;
                }
                return config;
            });
        }
        return this.httpInstance;
    }
}

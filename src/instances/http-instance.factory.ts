import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export type HttpConfig = {
    baseUrl: string;
    tokenName?: string
}

export class HttpInstanceFactory {
    private static httpInstance: AxiosInstance | null = null;

    public static getInstance(options: HttpConfig) {
        if (!this.httpInstance) {
            this.httpInstance = axios.create({
                baseURL: options.baseUrl,
            });
            if (options.tokenName) {
                this.httpInstance.interceptors.request.use(config => {
                    const token = Cookies.get(options.tokenName as string);
                    
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        delete config.headers.Authorization;
                    }
                    return config;
                });
            }
        }
        return this.httpInstance;
    }
}

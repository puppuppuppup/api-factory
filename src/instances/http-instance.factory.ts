import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export type HttpConfig = {
    baseUrl: string;
    tokenName?: string;
};

export class HttpInstanceFactory {
    private static httpInstance: AxiosInstance | null = null;

    public static getInstance(httpConfig: HttpConfig) {
        if (!this.httpInstance) {
            this.httpInstance = axios.create({
                baseURL: httpConfig.baseUrl,
            });
            if (httpConfig.tokenName) {
                this.httpInstance.interceptors.request.use(config => {
                    const token = Cookies.get(httpConfig.tokenName as string);

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

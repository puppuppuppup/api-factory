import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpInstanceFactory, HttpInstanceOptions } from './http-instance.factory';

type ApiTypes = {
    single: any;
    many: any;
    create: any;
    update: any;
};

export type ApiCustomTypes<
    DefaultTypes extends ApiTypes,
    CustomType extends Partial<ApiTypes> = {},
> = {
    [K in keyof ApiTypes]: K extends keyof CustomType ? CustomType[K] : DefaultTypes[K];
};

export type ApiBaseTypes<BaseType> = ApiCustomTypes<{
    single: BaseType;
    many: BaseType[];
    create: Omit<BaseType, 'id'>;
    update: Partial<Omit<BaseType, 'id'>>;
}>;

export abstract class ApiInstance<Types extends ApiTypes> {
    protected httpInstance: AxiosInstance;
    protected endpoint: string;

    protected constructor(endpoint: string, options: HttpInstanceOptions) {
        this.endpoint = endpoint;
        this.httpInstance = HttpInstanceFactory.getInstance(options);
    }

    public async findOne(id: string | number, config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this.httpInstance.get<Types['single']>(`${this.endpoint}/${id}`, config);
        return res.data;
    }

    public async findMany(config?: AxiosRequestConfig): Promise<Types['many']> {
        const res = await this.httpInstance.get<Types['many']>(this.endpoint, config);
        return res.data;
    }

    public async create(data: Types['create'], config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this.httpInstance.post<Types['single']>(this.endpoint, data, config);
        return res.data;
    }

    public async update(id: string | number, data: Types['update'], config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this.httpInstance.put<Types['single']>(`${this.endpoint}/${id}`, data, config);
        return res.data;
    }

    public async delete(id: string | number, config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this.httpInstance.delete<Types['single']>(`${this.endpoint}/${id}`, config);
        return res.data;
    }
}

export const getApi = <Types extends ApiTypes, ExtendedApi = ApiInstance<Types>>(
    endpoint: string,
    options: HttpInstanceOptions
) => {
    return class Api extends ApiInstance<Types> {
        private static instance: ExtendedApi | null = null;

        public static getInstance(): ExtendedApi {
            if (!this.instance) {
                this.instance = new this(endpoint, options) as ExtendedApi;
            }
            return this.instance;
        }
    };
};

export class ApiFactory {
    private options: HttpInstanceOptions;

    constructor(defaultOptions: HttpInstanceOptions) {
        this.options = defaultOptions;
    }

    public getApi = <Types extends ApiTypes, ExtendedApi = ApiInstance<Types>>(
        endpoint: string,
        options: HttpInstanceOptions = this.options
    ) => {
        return class Api extends ApiInstance<Types> {
            private static instance: ExtendedApi | null = null;
    
            public static getInstance(): ExtendedApi {
                if (!this.instance) {
                    this.instance = new this(endpoint, options) as ExtendedApi;
                }
                return this.instance;
            }
        };
    };
}

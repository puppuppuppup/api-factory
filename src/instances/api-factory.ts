import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpInstanceFactory, HttpConfig } from './http-instance.factory';

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

abstract class ApiInstance<Types extends ApiTypes> {
    public _httpInstance: AxiosInstance;
    public _endpoint: string;

    protected constructor(endpoint: string, config: HttpConfig) {
        this._endpoint = endpoint;
        this._httpInstance = HttpInstanceFactory.getInstance(config);
    }

    public async findOne(id: string | number, config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this._httpInstance.get<Types['single']>(`${this._endpoint}/${id}`, config);
        return res.data;
    }

    public async findMany(config?: AxiosRequestConfig): Promise<Types['many']> {
        const res = await this._httpInstance.get<Types['many']>(this._endpoint, config);
        return res.data;
    }

    public async create(data: Types['create'], config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this._httpInstance.post<Types['single']>(this._endpoint, data, config);
        return res.data;
    }

    public async update(id: string | number, data: Types['update'], config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this._httpInstance.put<Types['single']>(`${this._endpoint}/${id}`, data, config);
        return res.data;
    }

    public async delete(id: string | number, config?: AxiosRequestConfig): Promise<Types['single']> {
        const res = await this._httpInstance.delete<Types['single']>(`${this._endpoint}/${id}`, config);
        return res.data;
    }
}

export class ApiFactory {
    private config: HttpConfig;

    constructor(defaultOptions: HttpConfig) {
        this.config = defaultOptions;
    }
    
    public getApi = <Types extends ApiTypes, ExtendedApi = ApiInstance<Types>>(
        endpoint: string,
        config: HttpConfig = this.config
    ) => {
        return class Api extends ApiInstance<Types> {
            static #instance: ExtendedApi | null = null;
    
            public static getInstance(): ExtendedApi {
                if (!this.#instance) {
                    this.#instance = new this(endpoint, config) as ExtendedApi;
                }
                return this.#instance;
            }
        };
    };
}

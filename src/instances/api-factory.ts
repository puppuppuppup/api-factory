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

type ApiProps = { endpoint: string; httpConfig: HttpConfig };

export class Api<Types extends ApiTypes = ApiTypes> {
    protected httpInstance: AxiosInstance;
    protected endpoint: string;

    public constructor({ endpoint, httpConfig }: ApiProps) {
        this.endpoint = endpoint;
        this.httpInstance = HttpInstanceFactory.getInstance(httpConfig);
    }

    public async findOne(
        id: string | number,
        config?: AxiosRequestConfig,
    ): Promise<Types['single']> {
        const res = await this.httpInstance.get<Types['single']>(`${this.endpoint}/${id}`, config);
        return res.data;
    }

    public async findMany(config?: AxiosRequestConfig): Promise<Types['many']> {
        const res = await this.httpInstance.get<Types['many']>(this.endpoint, config);
        return res.data;
    }

    public async create(
        data: Types['create'],
        config?: AxiosRequestConfig,
    ): Promise<Types['single']> {
        const res = await this.httpInstance.post<Types['single']>(this.endpoint, data, config);
        return res.data;
    }

    public async update(
        id: string | number,
        data: Types['update'],
        config?: AxiosRequestConfig,
    ): Promise<Types['single']> {
        const res = await this.httpInstance.put<Types['single']>(
            `${this.endpoint}/${id}`,
            data,
            config,
        );
        return res.data;
    }

    public async delete(
        id: string | number,
        config?: AxiosRequestConfig,
    ): Promise<Types['single']> {
        const res = await this.httpInstance.delete<Types['single']>(
            `${this.endpoint}/${id}`,
            config,
        );
        return res.data;
    }
}

type ApiConfig<T extends typeof Api> = {
    instance: T;
    endpoint: string;
    httpConfig?: HttpConfig;
};

type ApiConfigList = Record<string, ApiConfig<any>>;

type ApiList<Config extends ApiConfigList> = {
    [K in keyof Config]: InstanceType<Config[K]['instance']>;
};

export class ApiFactory<Config extends ApiConfigList> {
    public apis: ApiList<Config> = {} as ApiList<Config>;

    constructor(config: Config, httpConfig: HttpConfig) {
        Object.keys(config).forEach(key => {
            const { endpoint, httpConfig: apiHttpConfig, instance } = config[key];
            this.apis[key as keyof Config] = new instance({
                endpoint,
                httpConfig: apiHttpConfig || httpConfig,
            });
        });
    }
}

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

// class ApiConfig<Types extends ApiTypes> {
//     constructor() {

//     }

// }

// type ApiConfig = Record<
//     string,
//     {
//         endpoint: string;
//         options?: HttpInstanceOptions;
//         instance?: new (config: { endpoint: string; options: HttpInstanceOptions }) => Api;
//     }
// >;
// type ApiList<Config extends ApiConfig> = Record<keyof Config, Api>;

// export class ApiFactory<Config extends ApiConfig> {
//     public APIs: ApiList<Config> = {} as ApiList<Config>;

//     constructor({ config, options }: { config: Config; options: HttpInstanceOptions }) {
//         Object.keys(config).forEach(apiKey => {
//             const { endpoint, instance, options: apiOptions } = config[apiKey];
//             if (instance) {
//                 this.APIs[apiKey as keyof Config] = new instance({
//                     endpoint,
//                     options: apiOptions || options,
//                 }) as InstanceType<typeof instance>;
//             } else {
//                 this.APIs[apiKey as keyof Config] = new Api({
//                     endpoint: endpoint,
//                     options: apiOptions || options,
//                 }) as Api;
//             }
//         });
//     }
// }

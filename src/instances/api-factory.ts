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

type ApiProps = { endpoint: string; httpInstance: AxiosInstance };

export class Api<Types extends ApiTypes = ApiTypes> {
    protected httpInstance: AxiosInstance;
    protected endpoint: string;

    public constructor({ endpoint, httpInstance }: ApiProps) {
        this.endpoint = endpoint;
        this.httpInstance = httpInstance;
    }

    public async findOne(
        id: string | number,
        config?: AxiosRequestConfig,
    ): Promise<Types['single']> {
        const res = await this.httpInstance.get<Types['single']>(`${this.endpoint}/${id}`, config);
        return res.data;
    }

    public async findAll(config?: AxiosRequestConfig): Promise<Types['many']> {
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
};

type ApisConfig = Record<string, ApiConfig<any>>;

type ApiList<Config extends ApisConfig> = {
    [K in keyof Config]: InstanceType<Config[K]['instance']>;
};

type ApiFactoryProps<Config extends ApisConfig> = {
    apisConfig: Config;
    httpConfig: HttpConfig;
};

export class ApiFactory<Config extends ApisConfig> {
    public apis: ApiList<Config> = {} as ApiList<Config>;
    private httpInstance: AxiosInstance;

    constructor({ apisConfig, httpConfig }: ApiFactoryProps<Config>) {
        this.httpInstance = HttpInstanceFactory.getInstance(httpConfig);

        Object.keys(apisConfig).forEach(key => {
            const { endpoint, instance } = apisConfig[key];

            this.apis[key as keyof Config] = new instance({
                endpoint,
                httpInstance: this.httpInstance,
            } satisfies ApiProps);
        });
    }
}

type User = {
    id: number;
    name: string;
    email: string;
};

const HTTP_CONFIG: HttpConfig = {
    baseUrl: 'base_url',
    tokenName: 'token_name',
};

class UsersExtendedApi extends Api<ApiBaseTypes<User>> {
    getMe() {
        return this.httpInstance.get(this.endpoint + '/me');
    }
}

const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        usersExtendedApi: {
            instance: UsersExtendedApi,
            endpoint: 'users',
        },
    },
});

apis.usersExtendedApi.getMe();

## Содержание
- [Содержание](#содержание)
- [О проекте](#о-проекте)
- [Быстрый старт](#быстрый-старт)
- [Инициализация](#инициализация)
- [Создание api](#создание-api)
- [Типизация](#типизация)
  - [Шаблонная типизация](#шаблонная-типизация)
  - [Кастомная типизация](#кастомная-типизация)
- [Расширение api](#расширение-api)

## О проекте
Данный проект предоставляет к использованию универсальное средство для создания API-сущностей с базовым наборов методов

Сделано на базе [`axios`](https://www.npmjs.com/package/axios)

## Быстрый старт
```ts
import { Api, ApiFactory, ApiBaseTypes, HttpConfig } from '@puppup/api-factory'

type MyType = {
    id: number;
    name: string;
    email: string;
};

const HTTP_CONFIG: HttpConfig = {
    baseUrl: 'base_url',
    tokenName: 'token_name',
};

// apis - хранилище всех указанных API
const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        myApi: {
            instance: Api<ApiBaseTypes<MyType>>,
            endpoint: 'my-endpoint',
        },
    },
});
```
## Инициализация

### `httpConfig`
Данное поле отвечает за настройку http-сущности, на базе которой будут строиться запросы API
- `baseUrl`: общая часть ссылки для всех API в пределах данной `ApiFactory` (например, домен)
- `tokenName`: название токена, которое используется в cookies в вашем веб-приложении. На его основании сущность будет устанавливать `Authorization`-хедер или удалять его.

### `apisConfig`

В данное поле мы передаем объект с настройками нужных нам API. Ключи объекта будут использованы, как названия соответствующих API, В него входят:
- `instance`: сущность, которая наследует класс `Api` и которая будет лежать в основе настройки методов и типов определенной API-сущности. Если отсутствует необходимость в типизации, можно передать `Api` без типов, но тогда для базовых методов будет применен `any`
- `endpoint`: эндпоинт, на который будет настроен API относительно `baseUrl` из `httpConfig` вашей `ApiFactory`

## Создание api
```ts
const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        myApi: {
            instance: Api,
            endpoint: 'endpoint',
        },
    },
});
```
Теперь мы имеем api-сущность `myApi`, предоставляющую методы:
- `findOne`
- `findMany`
- `create`
- `update`
- `delete`

Данные методы имеют предустановленный `endpoint`, который мы указали при создании сущности.

Также все методы поддерживают передачу последним параметром `AxiosRequestConfig`

## Типизация
Базовое использование `Api` в поле `instance` вернет нам сущность с методами, работающими с `any`, но мы можем протипизировать её.

Типизация разделена на:
- `single`
- `many`
- `create`
- `update`

Базовый набор функций используют типизацию следующим образом:
- `findOne` - возвращает `single`
- `findMany` - возвращает `many`
- `create` - принимает `create` и возвращает `single`
- `update` - принимает `update` и возвращает `single`
- `delete` - возвращает `single`

### Шаблонная типизация
```ts
import { ApiBaseTypes, ApiFactory, ... } from "@puppup/api-factory";

...

type User = {
    id: number;
    name: string;
    email: string;
}

// Использование утилиты для шаблонной типизации
type ApiTypes = ApiBaseTypes<User>;

const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        usersApi: {
            instance: Api<ApiTypes>,
            endpoint: 'users',
        },
    },
});
```
При использовании шаблона `ApiBaseTypes`, мы получаем базовую типизацию следующего вида:
```ts
export type ApiBaseTypes<BaseType> = ApiCustomTypes<{
    single: BaseType;
    many: BaseType[];
    create: Omit<BaseType, 'id'>;
    update: Partial<Omit<BaseType, 'id'>>;
}>;
```
### Кастомная типизация
Если необходимо переписать типы под определенные задачи, можно воспользоваться утилитой `ApiCustomTypes`, передав в неё необходимые типы
```ts
import { ApiCustomTypes, ApiFactory, ... } from "@puppup/api-factory";

...

type User = {
    id: number;
    name: string;
    email: string;
}

// Использование утилиты для кастомной типизации
type ApiTypes = ApiCustomTypes<{
    single: Pick<User, 'id'>,
    many: ApiTypes['single'][],
    create: Pick<User, 'email'>,
    update: Partial<User>,
}>;

const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        usersApi: {
            instance: Api<ApiTypes>,
            endpoint: 'users',
        },
    },
});
```
Также мы можем воспользоваться `ApiCustomTypes` на базе существующего типа для API, доработав его
```ts
import { ApiBaseTypes, ApiCustomTypes, ApiFactory, ... } from "@puppup/api-factory";

...

type User = {
    id: number;
    name: string;
    email: string;
}

// Базовые типы
type ApiTypes = ApiBaseTypes<User>;

// Модифицированные типы
type ApiModifiedTypes = ApiCustomTypes<ApiTypes, {
    create: Pick<User, 'id'>;
}>

const { apis } = new ApiFactory({
    httpConfig: HTTP_CONFIG,
    apisConfig: {
        usersApi: {
            instance: Api<ApiTypes>,
            endpoint: 'users',
        },
        usersModifiedApi: {
            instance: Api<ApiModifiedTypes>,
            endpoint: 'users',
        },
    },
});
```
## Расширение api
Если нам необходимо добавить свои методы, не входящие в стандартный набор, мы можем расширить существующий api
```ts
import { AxiosResponse } from "axios";
import { ApiBaseTypes, ApiFactory } from "@puppup/api-factory";

type User = {
    id: number;
    name: string;
    email: string;
}

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
```


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
import { ApiFactory } from '@puppup/api-factory'

type MyType = {
    id: number;
    name: string;
    email: string;
}

const apiFactory = new ApiFactory({
    baseUrl: 'base url',
    tokenName: 'token name'
})

type ApiTypes = ApiBaseTypes<MyType>;

class MyApi extends apiFactory.getApi<ApiTypes>('endpoint') {}
```
## Инициализация
```ts
import { ApiFactory } from '@puppup/api-factory'

const apiFactory = new ApiFactory({
    baseUrl: 'base url',
    tokenName: 'token name'
})
```

- `baseUrl` - устанавливает базовый url для всех api-сущностей, полученных через эту сущность `ApiFactory`
- `tokenName`: имя токена из cookies, на которое может сослаться api-сущность как для автоматического добавления Authorization-хедера, так и для его удаления, в случае отсутствия токена в cookies

## Создание api
```ts
class MyApi extends apiFactory.getApi('endpoint') {}
```
Теперь мы имеем api-сущность, предоставляющую методы:
- `findOne`
- `findMany`
- `create`
- `update`
- `delete`

Данные методы имеют предустановленный `endpoint`, который мы указали при создании сущности.

## Типизация
Базовое использование `getApi` вернет нам сущность с методами, работающими с `any`, но мы можем протипизировать её.

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

Также все методы поддерживают передачу последним параметром `AxiosRequestConfig`

### Шаблонная типизация
```ts
import { ApiBaseTypes, ApiFactory } from "@puppup/api-factory";

type User = {
    id: number;
    name: string;
    email: string;
}

type ApiTypes = ApiBaseTypes<User>;

class UsersApi extends apiFactory.getApi<ApiTypes>('users') {}
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
import { ApiCustomTypes, ApiFactory } from "@puppup/api-factory";

type User = {
    id: number;
    name: string;
    email: string;
}

type ApiTypes = ApiCustomTypes<{
    single: Pick<User, 'id'>,
    many: ApiTypes['single'][],
    create: Pick<User, 'email'>,
    update: Partial<User>,
}>;

class UsersApi extends apiFactory.getApi<ApiTypes>('users') {}
```
Также мы можем воспользоваться `ApiCustomTypes` на базе уже существующего типа для api, доработав его
```ts
import { ApiBaseTypes, ApiCustomTypes, ApiFactory } from "./src";

const apiFactory = new ApiFactory({
    baseUrl: 'base url',
    tokenName: 'token name'
})

type User = {
    id: number;
    name: string;
    email: string;
}

// Базовые типы
type ApiTypes = ApiBaseTypes<User>;
class UsersApi extends apiFactory.getApi<ApiTypes>('users') {}

// Модифицированные типы
type ApiModifiedTypes = ApiCustomTypes<ApiTypes, {
    create: Pick<User, 'id'>;
}>
class UsersModifiedApi extends apiFactory.getApi<ApiModifiedTypes>('users') {}
```
## Расширение api
Если нам необходимо добавить свои методы, не входящие в стандартный набор, мы можем расширить существующий api
```ts
import { AxiosResponse } from "axios";
import { ApiBaseTypes, ApiFactory } from "@puppup/api-factory";

const apiFactory = new ApiFactory({
    baseUrl: 'base url',
    tokenName: 'token name'
})

type User = {
    id: number;
    name: string;
    email: string;
}

type ApiTypes = ApiBaseTypes<User>;

type EmailData = {
    data: any
}

class UsersExtendedApi extends apiFactory.getApi<ApiTypes, UsersExtendedApi>('users') {
    public logEndpoint() {
        console.log(this.endpoint);
    }

    public sendEmail(data: any) {
        this.httpInstance.post<any, AxiosResponse, EmailData >('/email', {
            data: data,
        })
    }
}
```
Что было сделано:
1. Написаны новые методы
2. В дженерики `getApi` вторым параметром был прокинут класс расширяемого api для корректной типизации


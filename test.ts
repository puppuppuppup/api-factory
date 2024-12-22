import { Api, ApiBaseTypes } from './src/instances/api-factory';
import { HttpConfig } from './src/instances/http-instance.factory';

const HTTP_CONFIG: HttpConfig = {
    baseUrl: 'https://google.com',
};

type Post = {
    id: number;
    title: string;
    body: string;
};
type PostsApiTypes = ApiBaseTypes<Post>;
class PostsApi extends Api<PostsApiTypes> {
    logEndpoint() {
        console.log(this.endpoint);
    }
}

export const postsApi = new PostsApi({
    endpoint: 'posts',
    httpConfig: HTTP_CONFIG,
});
export const usersApi = new Api({
    endpoint: 'users',
    httpConfig: HTTP_CONFIG,
});

postsApi.logEndpoint();
usersApi.findMany();

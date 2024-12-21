import { ApiBaseTypes, ApiFactory } from "./instances/api-factory";

const apiFactory = new ApiFactory({
    baseUrl: 'base_url'
})

class TestApi extends apiFactory.getApi<any, TestApi>('123') {
    logEndpoint() {
        console.log(this._endpoint);
    }
}

TestApi.getInstance().logEndpoint();

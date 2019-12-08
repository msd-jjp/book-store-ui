import { AxiosResponse } from "axios";
import { appLocalStorage } from ".";

export class ParseApi {
    static parseResponse(response: AxiosResponse<any>) {
        if (response.config.url === "/api/books/_search" || response.config.url === "/api/books/search-phrase") {
            // debugger;
            // if (response.config.data) {
            //     // let data = JSON.parse(response.config.data);
            // }
            appLocalStorage.addDataToCollection('clc_book', response.data.result);

        } else if (response.config.url
            && response.config.url.includes('/api/books/')
            && response.config.method === "get") {

            // debugger;
            appLocalStorage.addDataToCollection('clc_book', response.data);
        }
        else if (response.config.url && response.config.url.includes('/api/comments/book/')) {
            appLocalStorage.addDataToCollection('clc_comment', response.data.result);

        }
        else if (response.config.url &&
            response.config.url.includes('/api/comments/') &&
            response.config.method === "delete") {

            const id = response.config.url.replace('/api/comments/', '');
            appLocalStorage.removeFromCollection("clc_comment", id);
        }
        else if (response.config.url &&
            response.config.url.includes('/api/orders/user') &&
            response.config.method === "post") {

            appLocalStorage.addDataToCollection('clc_userInvoicedOrder', response.data.result);
        }
        else if (response.config.url &&
            response.config.url.includes('/api/order-items/order/') &&
            response.config.method === "get") {

            appLocalStorage.storeData_userInvoicedOrderItem(response.data.result);
        }
        else if (response.config.url &&
            response.config.url.includes('/api/accounts/user/_search') &&
            response.config.method === "post") {

            appLocalStorage.addDataToCollection('clc_userAccount', response.data.result);
        }
        else if (response.config.url &&
            response.config.url.includes('/api/device-keys') &&
            response.config.method === "post") {

            appLocalStorage.addDataToCollection('clc_deviceKey', response.data);
        }
        else if (response.config.url &&
            response.config.url.includes('/api/device-keys/user/') &&
            response.config.method === "get") {

            appLocalStorage.clearCollection('clc_deviceKey');
            appLocalStorage.addDataToCollection('clc_deviceKey', response.data.result);
        }

        else if (response.config.url &&
            response.config.url.includes('/api/device-keys/') &&
            response.config.method === "delete") {
            const id = response.config.url.replace('/api/device-keys/', '');
            appLocalStorage.removeFromCollection("clc_deviceKey", id);
        }
    }
}
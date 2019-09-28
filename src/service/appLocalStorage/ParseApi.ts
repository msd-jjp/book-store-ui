import { AxiosResponse } from "axios";
import { appLocalStorage } from ".";

export class ParseApi{
    static parseResponse(response: AxiosResponse<any>){
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
    }
}
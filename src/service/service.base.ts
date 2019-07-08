import axios, { AxiosInstance } from 'axios';
import { Setup } from '../config/setup';
import { IToken } from '../model/model.token';

export interface IAPI_ResponseList<T> {
    data: { result: T[] };
}
export interface IAPI_Response<T> {
    data: T;
}

export abstract class BaseService {
    baseURL = Setup.endpoint;
    token: IToken | null | undefined;

    axiosInstance: AxiosInstance = axios.create({
        baseURL: this.baseURL,
        headers: { 'Content-Type': 'application/json' }
    });

    get axiosTokenInstance(): AxiosInstance {
        if (this.token && this.token.id) {
            return axios.create({
                baseURL: this.baseURL,
                headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + this.token.id }
            });
        } else {
            return this.axiosInstance;
        }
    }

    setToken(t: IToken) {
        this.token = t;
    }

}
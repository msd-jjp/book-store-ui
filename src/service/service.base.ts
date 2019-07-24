import axios, { AxiosInstance } from 'axios';
import { Setup } from '../config/setup';
import { IToken } from '../model/model.token';
import { Store2 } from '../redux/store';
import { action_set_token } from '../redux/action/token';
import { Utility } from '../asset/script/utility';
import { appLocalStorage } from './appLocalStorage';


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

    // _axiosTokenInstance: AxiosInstance | undefined;

    constructor() {
        // this.set_401_interceptors();
        this.set_store_interceptors(this.axiosInstance);
    }

    get axiosTokenInstance(): AxiosInstance {
        // if (this._axiosTokenInstance) { return this._axiosTokenInstance; }
        let newAX_instance: AxiosInstance;
        if (this.token && this.token.id) {
            newAX_instance = axios.create({
                baseURL: this.baseURL,
                headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + this.token.id }
            });
        } else {
            newAX_instance = this.axiosInstance;
        }
        this.set_401_interceptors(newAX_instance);
        this.set_store_interceptors(newAX_instance);
        return newAX_instance;
        // return this._axiosTokenInstance;
    }

    setToken(t: IToken) {
        this.token = t;
    }

    set_401_interceptors(ax_instance: AxiosInstance) {
        ax_instance.interceptors.response.use((response) => {
            // Return a successful response back to the calling service
            return response;
        }, (error) => {
            // Return any error which is not due to authentication back to the calling service
            if (!error.response || (error.response && error.response.status !== 401)) {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }

            // Logout user if token refresh didn't work or user is disabled
            /* if (error.config.url == '/api/token/refresh' || error.response.message == 'Account is disabled.') {
              
              TokenStorage.clear();
              router.push({ name: 'root' });
        
              return new Promise((resolve, reject) => {
                reject(error);
              });
            } */

            let authObj = Utility.get_decode_auth(Store2.getState().authentication)
            // Try request again with new token
            return this.getTokenfromServer(authObj)
                .then((token) => {
                    Store2.dispatch(action_set_token(token.data));
                    this.setToken(token.data);

                    // New request with new token
                    const config = error.config;
                    config.headers['authorization'] = `Bearer ${token.data.id}`; // Authorization
                    config.baseURL = '';

                    return new Promise((resolve, reject) => {
                        axios.request(config).then(response => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        })
                    });

                })
                .catch((error) => {
                    return new Promise((resolve, reject) => {
                        reject(error);
                    });
                });
        });
    }

    getTokenfromServer(data: { username: string, password: string }): Promise<IAPI_Response<IToken>> {
        let username_password_str = data.username + ":" + data.password;
        let hash = btoa(unescape(encodeURIComponent(username_password_str))); // btoa(token);
        let basic = "Basic " + hash;

        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'Authorization': basic }
        });

        return instance.post('/tokens', {});
    }

    set_store_interceptors(ax_instance: AxiosInstance) {
        // debugger;
        ax_instance.interceptors.response.use((response) => {

            try {
                appLocalStorage.storeUsefullResponse(response);
            } catch (e) {
                debugger;
            }

            return response;
        }, (error) => {
            // return error;
            return new Promise((resolve, reject) => {
                reject(error);
            });
        });
    }

    isAppOffline(): boolean {
        if (navigator && !navigator.onLine) {
            return true;
        }
        return false;
    }

}
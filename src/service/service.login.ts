import axios from 'axios';
import { IUser } from '../model/model.user';
// import { Setup } from '../config/setup';
import { BaseService } from './service.base';
// import { IToken } from '../model/model.token';

export class LoginService extends BaseService {

    login(data: { username: string, password: string }): Promise<{
        data: {
            expiration_date: number;
            id: string;
            username: string;
        };
        [key: string]: any
    }> {
        let username_password_str = data.username + ":" + data.password;
        let hash = btoa(unescape(encodeURIComponent(username_password_str))); // btoa(token);
        let basic = "Basic " + hash;

        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'Authorization': basic }
        });

        return instance.post('/tokens', {});
    }


    profile(/* tokenId: IToken['id'] */): Promise<IUser> {
        /* const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + tokenId }
        }); */

        return this.axiosTokenInstance.get('users/profile');
    }
    forgotPassword(usernameOrMobile: {'username': string} | {'cell_no': string}): Promise<string> {

        return this.axiosInstance.post('/users/forget-password', usernameOrMobile);
    }
}

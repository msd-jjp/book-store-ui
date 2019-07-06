import axios from 'axios';
import { IUser } from '../model/model.user';
// import { Setup } from '../config/setup';
import { BaseService } from './service.base';
import { IToken } from '../model/model.token';

export class LoginService extends BaseService {

    login(data: { username: string, password: string }): Promise<{
        data: {
            expiration_date: number;
            id: string;
            username: string;
        };
        [key: string]: any
    }> {
        var token = data.username + ":" + data.password;
        var hash = btoa(token);
        let basic = "Basic " + hash;

        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'Authorization': basic }
        });

        return instance.post('/tokens', {});
    }

    profile_DELETE_ME(token: string/* , data: { username: string, password: string } */): Promise<IUser> {
        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
        });

        return instance.post('/profile', {});
    }

    profile(tokenId: IToken['id']): Promise<IUser> {
        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + tokenId }
        });

        return instance.get('users/profile');
    }
}

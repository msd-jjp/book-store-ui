import axios from 'axios';
import { IUser } from '../model/model.user';
import { Setup } from '../config/setup';

export class LoginService {

    login(data: { username: string, password: string }): Promise<string> {
        var token = data.username + ":" + data.password;
        var hash = btoa(token);
        let basic = "Basic " + hash;

        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'application/json', 'Authorization': basic }
        });

        return instance.post('/tokens', {});
    }
    profile(token: string/* , data: { username: string, password: string } */): Promise<IUser> {
        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
        });

        return instance.post('/profile', {});
    }
}

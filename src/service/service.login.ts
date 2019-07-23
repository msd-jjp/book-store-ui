import { IUser } from '../model/model.user';
import { BaseService, IAPI_Response } from './service.base';
import { IToken } from '../model/model.token';

export class LoginService extends BaseService {

    login(data: { username: string, password: string }): Promise<IAPI_Response<IToken>> {
        /* let username_password_str = data.username + ":" + data.password;
        let hash = btoa(unescape(encodeURIComponent(username_password_str))); // btoa(token);
        let basic = "Basic " + hash;

        const instance = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json', 'Authorization': basic }
        });

        return instance.post('/tokens', {}); */
        return this.getTokenfromServer(data);
    }

    profile(): Promise<IUser> {
        return this.axiosTokenInstance.get('users/profile');
    }

    forgotPassword(mobile: { username: string } | { cell_no: string }): Promise<string> {
        return this.axiosInstance.post('/forget-password/send-code', mobile);
    }

    resetPassword(data: {
        cell_no: string;
        code: string;
        password: string;
    }): Promise<string> {

        return this.axiosInstance.post('/users/reset-password', data);
    }

}

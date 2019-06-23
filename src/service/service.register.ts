import axios from 'axios';
// import { IUser } from '../model/model.user';
import { Setup } from '../config/setup';

export class RegisterService {

    sendCode(data: { cell_no: string }): Promise<any> {//{ cell_no: string; message: string; }
        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'application/json' }
        });

        return instance.post('/register/send-code', data);
    }
    activateAcount(data: {
        "cell_no": string;
        "activation_code": string;
    }): Promise<any> {//IUser
        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'application/json' }
        });

        return instance.post('/register/activate-acount', data);
    }

    signUp(data: {
        "user": {
            "password": string;
            "username": string;
        },
        "persone": {
            "address": string;
            "email": string;
            "last_name": string;
            "name": string;
            "phone": string;
        },
        "cell_no": string;
        "signup_token": string;
    }): any {
        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'application/json' }
        });

        return instance.post('/sign-up', data);
    }
}

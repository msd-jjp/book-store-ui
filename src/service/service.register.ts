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

    /* 
    {
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
        }
    */

    signUp(data: {
        // "user": {
        "password": string;
        "username": string;
        // },
        // "persone": {
        "address"?: string;
        "email"?: string;
        "last_name"?: string;
        "name": string;
        "phone"?: string;
        // },
        "cell_no": string;
        "signup_token": string;
    }): any {
        const instance = axios.create({
            baseURL: Setup.endpoint,
            headers: { 'Content-Type': 'multipart/form-data' } // application/json, multipart/form-data
        });

        let bodyFormData = new FormData();
        // bodyFormData.set('userName', 'Fred');
        // bodyFormData.append('image', imageFile); 

        bodyFormData.set('password', data.password);
        bodyFormData.set('username', data.username);
        data.address && bodyFormData.set('address', data.address);
        data.email && bodyFormData.set('email', data.email);
        data.last_name && bodyFormData.set('last_name', data.last_name);
        bodyFormData.set('name', data.name);
        data.phone && bodyFormData.set('phone', data.phone);
        bodyFormData.set('cell_no', data.cell_no);
        bodyFormData.set('signup_token', data.signup_token);
        /* Object.keys(data).forEach((dd: string) => {
            let val = data[dd];
            bodyFormData.set(dd, val);
        }); */

        return instance.post('/sign-up', bodyFormData);
    }
}

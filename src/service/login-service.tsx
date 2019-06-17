import axios from 'axios';
import { IUser } from '../model/model.user';

class loginService {

    login(data: { username: string, password: string }): Promise<IUser> {
        const instance = axios.create({
            baseURL: '/api/',
            // timeout: 1000,
            // headers: {'X-Custom-Header': 'foobar'}
        });

        return instance.post('/login', data);
    }
}

export default loginService;
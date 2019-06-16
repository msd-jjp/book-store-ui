import axios from 'axios';
import { loginState } from '../component/login/Login';

class loginService {

    login(data: loginState) {
        const instance = axios.create({
            baseURL: '/api/',
            // timeout: 1000,
            // headers: {'X-Custom-Header': 'foobar'}
        });

        return instance.post('/login', data);
    }
}

export default loginService;
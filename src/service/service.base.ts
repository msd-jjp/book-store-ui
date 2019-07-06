import axios from 'axios';
import { Setup } from '../config/setup';

export abstract class BaseService {
    baseURL = Setup.endpoint;
    axiosInstance = axios.create({
        baseURL: this.baseURL,
        headers: { 'Content-Type': 'application/json' }
    });
}
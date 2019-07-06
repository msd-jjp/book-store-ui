import { BaseService } from './service.base';

export class BookService extends BaseService {

    search(data: { title: string }): Promise<any> {
        return this.axiosInstance.post('/register/send-code', data);
    }

}

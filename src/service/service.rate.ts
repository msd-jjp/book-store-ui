import { BaseService } from './service.base';

export class RateService extends BaseService {

    add(book_id: string, rate: number): Promise<any> {
        return this.axiosTokenInstance.post('/rates', { book_id, rate });
    }

}

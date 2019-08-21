import { BaseService } from './service.base';

interface IOrderItem {
    book_id: string;
    count: number;
}

type IOrderItems = IOrderItem[];

export class OrderService extends BaseService {

    order(items: IOrderItems, person_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/orders', { items, person_id });
    }

}

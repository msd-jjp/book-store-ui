import { BaseService, IAPI_Response } from './service.base';

interface IOrderItem {
    book_id: string;
    count: number;
}

type IOrderItems = IOrderItem[];

export class OrderService extends BaseService {

    order(items: IOrderItems, person_id: string): Promise<IAPI_Response<any>> {
        return this.axiosTokenInstance.post('/orders', { items, person_id });
    }

    checkout(order_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/orders/checkout/${order_id}`);
    }

    fetchPrice(items: IOrderItems, person_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/orders/fetchPrice', { items, person_id });
    }

}

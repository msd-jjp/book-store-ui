import { BaseService, IAPI_Response } from './service.base';

interface IOrderItem {
    book_id: string;
    count: number;
}

export type IOrderItems = IOrderItem[];

export class OrderService extends BaseService {

    order(items: IOrderItems, person_id: string): Promise<IAPI_Response<any>> {
        return this.axiosTokenInstance.post('/orders', { items, person_id });
    }

    checkout(order_id: string, person_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/orders/checkout/${order_id}`, { person_id });
    }

}

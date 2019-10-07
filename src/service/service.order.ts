import { BaseService, IAPI_Response, IAPI_ResponseList } from './service.base';
import { IOrder, IOrderItem } from '../model/model.order';

interface IOrderItem_detail {
    book_id: string;
    count: number;
}

export type IOrderItems_detail = IOrderItem_detail[];

export class OrderService extends BaseService {

    order(items: IOrderItems_detail, person_id: string): Promise<IAPI_Response<IOrder>> {
        return this.axiosTokenInstance.post('/orders', { items, person_id });
    }

    checkout(order_id: string, person_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/orders/checkout/${order_id}`, { person_id });
    }

    search(limit: number, offset: number, filter?: Object): Promise<IAPI_ResponseList<IOrder>> {
        return this.axiosTokenInstance.post(`/orders/_search`, { limit, offset, filter });
    }

    getOrderItems(order_id: string): Promise<IAPI_ResponseList<IOrderItem>> {
        return this.axiosTokenInstance.get(`/order-items/order/${order_id}`);
    }

}

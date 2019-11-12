import { BaseService, IAPI_Response, IAPI_ResponseList } from './service.base';
import { IOrder, IOrderItem } from '../model/model.order';
import { appLocalStorage } from './appLocalStorage';

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

    userOrder(items: IOrderItems_detail): Promise<IAPI_Response<IOrder>> {
        return this.axiosTokenInstance.post('/orders', { items });
    }

    userCheckout(order_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/orders/checkout/${order_id}`);
    }

    search(limit: number, skip: number, filter?: Object): Promise<IAPI_ResponseList<IOrder>> {
        return this.axiosTokenInstance.post(`/orders/_search`, { limit, skip, filter });
    }

    search_userOrder(limit: number, skip: number, filter?: Object): Promise<IAPI_ResponseList<IOrder>> {
        if (BaseService.isAppOffline()) {
            let res: IOrder[] | null = appLocalStorage.search_by_query_userInvoicedOrder({ limit, skip });
            res = res || [];
            return new Promise((resolve, reject) => {
                resolve({ data: { result: res! } });
            });
        }
        return this.axiosTokenInstance.post(`/orders/user`, { limit, skip, filter });
    }

    getOrderItems(order_id: string): Promise<IAPI_ResponseList<IOrderItem>> {
        if (BaseService.isAppOffline()) {
            let res: IOrderItem[] | undefined = appLocalStorage.find_orderItems_by_order_id(order_id);
            if (res) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: res! } });
                });
            } else {
                //reject: put if else into Promise
            }
        }
        return this.axiosTokenInstance.get(`/order-items/order/${order_id}`);
    }

}

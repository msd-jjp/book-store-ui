import { BaseService, IAPI_Response } from './service.base';
import { IOrderItems } from './service.order';

export class PriceService extends BaseService {

    calcPrice(items: IOrderItems, person_id: string): Promise<IAPI_Response<any>> {
        return this.axiosTokenInstance.post('/prices/calc-price', { items, person_id });
    }

}

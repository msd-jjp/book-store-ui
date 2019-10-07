import { BaseService, IAPI_Response } from './service.base';
import { IOrderItems_detail } from './service.order';

export class PriceService extends BaseService {

    calcPrice(items: IOrderItems_detail, person_id: string): Promise<IAPI_Response<any>> {
        return this.axiosTokenInstance.post('/prices/calc-price', { items, person_id });
    }

}

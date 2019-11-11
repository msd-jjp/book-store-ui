import { BaseService, IAPI_ResponseList } from './service.base';
import { IAccount } from '../model/model.account';

export class AccountService extends BaseService {

    // getAll(book_id: string, rate: number): Promise<any> {
    //     return this.axiosTokenInstance.post('/rates', { book_id, rate });
    // }

    getUserMainAccount(): Promise<IAPI_ResponseList<IAccount>> {
        return this.axiosTokenInstance.post('/accounts/user/_search', { limit: 1, skip: 0, filter: { type: 'Main' } });
    }

    userPayment_send(amount: number, call_back_url: string) {
        return this.axiosTokenInstance.post('/payment_send', { amount, call_back_url });
    }

}

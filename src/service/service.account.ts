import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IAccount } from '../model/model.account';

export class AccountService extends BaseService {

    // getAll(book_id: string, rate: number): Promise<any> {
    //     return this.axiosTokenInstance.post('/rates', { book_id, rate });
    // }

    getUserMainAccount(): Promise<IAPI_ResponseList<IAccount>> {
        return this.axiosTokenInstance.post('/accounts/user/_search', { limit: 1, skip: 0, filter: { type: 'Main' } });
    }

    userPayment_send(amount: number, call_back_url: string): Promise<IAPI_Response<string>> { // HTMLElement
        // debugger;
        // this.axiosTokenInstance.defaults.responseType = 'document';
        // const axiosInstance = Axios.create({
        //     baseURL: this.baseURL,
        //     headers: {
        //         'Content-Type': 'text/html',
        //         // 'Content-Type': 'HTMLElement',
        //         'authorization': 'Bearer ' + Store2.getState().token.id
        //     },
        //     // responseType: 'document',
        // });
        // this.axiosTokenInstance.defaults.headers['Content-Type'] = 'text/html';
        return this.axiosTokenInstance.post('/payment_send', { amount, call_back_url });
    }

}

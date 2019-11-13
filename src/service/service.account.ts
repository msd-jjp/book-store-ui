import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IAccount } from '../model/model.account';
import { appLocalStorage } from './appLocalStorage';

export class AccountService extends BaseService {

    // getAll(): Promise<any> {
    // }

    getUserMainAccount(offline?: boolean): Promise<IAPI_ResponseList<IAccount>> {
        if (BaseService.isAppOffline() || offline === true) {
            let list: IAccount[] | null = appLocalStorage.search_userMainAccount();
            list = list || [];
            return new Promise((resolve) => { resolve({ data: { result: list! } }); });
        }
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
        return this.axiosTokenInstance.post('/payment-send', { amount, call_back_url });
    }

}

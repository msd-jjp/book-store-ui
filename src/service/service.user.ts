import { BaseService } from './service.base';

export class UserService extends BaseService {

    changePassword(old_password: string, new_password: string): Promise<any> {
        return this.axiosInstance.post('/users/change-password', { old_password, new_password });
    }

}

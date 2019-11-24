import { BaseService } from './service.base';

export class UserService extends BaseService {

    changePassword(old_password: string, new_password: string, user_id: string): Promise<any> {
        return this.axiosTokenInstance.put(`/users/${user_id}`, { old_password, password: new_password });
    }

}

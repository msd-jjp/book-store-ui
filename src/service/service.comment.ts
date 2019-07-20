import { BaseService } from './service.base';

export class CommentService extends BaseService {

    add(person_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/follow', { following_id: person_id });
    }

}

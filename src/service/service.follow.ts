import { BaseService } from './service.base';

export class FollowService extends BaseService {

    follow_person(person_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/follow', { following_id: person_id });
    }

    unfollow_person(person_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/follow/${person_id}`);
    }

}

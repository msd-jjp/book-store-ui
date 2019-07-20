import { BaseService } from './service.base';

export class CommentService extends BaseService {

    like(comment_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/comment-actions/like/${comment_id}`);
    }

    unlike(comment_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/comment-actions/like/${comment_id}`);
    }

    book_comments(book_id: string): Promise<any> { // todo: comment_model
        return this.axiosTokenInstance.get(`/comments/book/${book_id}`);
    }

}

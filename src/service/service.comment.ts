import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { COMMENT_REPORT } from '../enum/Comment';
import { IComment } from '../model/model.comment';
import { appLocalStorage } from './appLocalStorage';

export class CommentService extends BaseService {

    like(comment_id: string): Promise<any> {
        return this.axiosTokenInstance.post(`/comment-actions/like/${comment_id}`);
    }

    unlike(comment_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/comment-actions/like/${comment_id}`);
    }

    report(comment_id: string, report: COMMENT_REPORT = COMMENT_REPORT.Personal): Promise<any> {
        return this.axiosTokenInstance.post(`/comment-actions/report/${comment_id}`, { report });
    }

    unreport(comment_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/comment-actions/report/${comment_id}`);
    }

    // book_comments(book_id: string): Promise<IAPI_ResponseList<IComment>> {
    //     return this.axiosTokenInstance.get(`/comments/book/${book_id}`);
    // }

    search(book_id: string, data: { limit: number, offset: number, filter?: Object }): Promise<IAPI_ResponseList<IComment>> {
        if (this.isAppOffline()) {
            let lcl_comment_list: IComment[] | null = appLocalStorage.search_by_query_comment(book_id, data);
            if (lcl_comment_list && lcl_comment_list.length) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: lcl_comment_list! } });
                });
            }
        }
        return this.axiosTokenInstance.post(`/comments/book/${book_id}`, data);
    }

    add(body: string, book_id: string): Promise<IAPI_Response<IComment>> {
        return this.axiosTokenInstance.post(`/comments`, { body, book_id });
    }

    remove(comment_id: string) {
        return this.axiosTokenInstance.delete(`/comments/${comment_id}`);
    }

    update(comment_id: string, body: string) {
        return this.axiosTokenInstance.put(`/comments/${comment_id}`, { body });
    }

}

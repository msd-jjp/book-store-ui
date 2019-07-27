import { BaseModel } from "./model.base";
// import { IBook } from "./model.book";
import { IPerson } from "./model.person";

export interface IComment extends BaseModel {
    body: string;
    likes: number;
    reports: number;
    liked_by_user: boolean;
    reported_by_user: boolean;
    rate_by_user: number;
    book_id: string;
    // book: IBook;
    person: IPerson;
    parent?: IComment;
}
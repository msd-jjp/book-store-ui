import { BaseModel } from "./model.base";
import { IBook } from "./model.book";

export interface IPerson extends BaseModel {
    name: string;
    last_name?: string;
    address?: string;
    phone: string;
    image?: string;
    email?: string;
    cell_no?: string;
    // current_book_id?: string;
    current_book?: IBook;
    bio?: string;
    following_list?: string[];
    wish_list?: IBook[];
}
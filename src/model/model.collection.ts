import { IBook } from "./model.book";

export interface ICollection {
    books: IBook[];
    title: string;
}

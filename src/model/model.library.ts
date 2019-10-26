import { IBook } from "./model.book";

export interface ILibrary {
    id: string;
    book: IBook;
    status: {
        status: string; // "buyed",
        reading_started: boolean;
        read_pages: number;
        read_duration: number;
        progess : number;
    },
}

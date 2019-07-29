import { BaseModel } from "./model.base";
import { BOOK_GENRE, BOOK_TYPES, BOOK_ROLES } from "../enum/Book";
import { IPerson } from "./model.person";

export interface IBook extends BaseModel {
    // name: string;
    edition: string;
    genre: BOOK_GENRE[];
    images: string[]; // image_url
    language: string;
    pub_year: string;
    rate: number;
    rate_no: number;
    title: string;
    type: BOOK_TYPES[] | BOOK_TYPES;
    roles: {
        role: BOOK_ROLES;
        person: IPerson;
    }[];
    files: string[]; // file-url
    description: string;
    isben: string;
    pages: string;
    duration: string;
    from_editor: string;
}

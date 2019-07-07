import { BaseModel } from "./model.base";
import { BOOK_GENRE, BOOK_TYPES, BOOK_ROLES } from "../enum/Book";
import { IPerson } from "./model.person";

export interface IBook extends BaseModel {
    name: string;
    edition: string;
    genre: BOOK_GENRE[];
    images: string[]; // image_url
    language: string;
    pub_year: string;
    rate: number;
    title: string;
    type: BOOK_TYPES[]
    roles: {
        role: BOOK_ROLES;
        person: IPerson;
    }[];
    /* {
        [key in BOOK_ROLES]: IPerson['id'];
    }; */
    files: string[]; // file-url
}

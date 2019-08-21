import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { IBook } from "../../../model/model.book";

export interface ICartItem {
    book: IBook;
    count: number;
}

export type ICartItems = ICartItem[];

export interface ICartAction extends Action<EACTIONS> {
    payload: ICartItem | null;
}
import { BaseModel } from "./model.base";
import { IPerson } from "./model.person";
import { IBook } from "./model.book";

export interface IOrder extends BaseModel {
    status: "Created" | 'Invoiced';
    total_price: number;
    person: IPerson;
    modification_date?: number;
}

export interface IOrderItem extends BaseModel {
    book: IBook;
    count: number;
    order: IOrder;
}